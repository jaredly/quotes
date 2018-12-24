import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { css } from 'glamor'

const check = password => fetch('/check', {headers: {'Authentication': 'Bearer ' + password}}).then(res => res.status === 204);
const getQuotes = () => fetch('/quotes', {headers: {'Authentication': 'Bearer ' + localStorage.password}}).then(res => res.json());
const submitQuote = (quote) => fetch('/quotes', {method: 'PUT', body: JSON.stringify(quote), headers: {'Content-Type': 'application/json', 'Authentication': 'Bearer ' + localStorage.password}}).then(res => {
  if (res.status !== 204) {
    throw new Error('Invalid response: ' + res.status);
  }
});

function Login({onLogin}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  return <div className={css({padding: 20})}>
    <TextField autoFocus error={error} value={value} onChange={evt => {
        setValue(evt.target.value)
        setError(false)
      }} placeholder="Enter password" />
    <Button variant="contained" color="primary" onClick={() => {
        check(value).then(success => {
          if (success) {
            onLogin(value)
          } else {
            setError(true)
          }
        })
      }}>
      Login
    </Button>
  </div>
}

function renderRandom(quotes) {
  if (quotes == null) {
    return 'Loading...'
  }
  if (!quotes.length) {
    return 'No quotes'
  }
  const index = parseInt(Math.random() * quotes.length)
  const {speaker, context, secondSpeaker, quote, response, date} = quotes[index];
  return <div>
    <div style={{fontWeight: 'bold', color: '#999'}}>{speaker}</div>
    <div>{quote}</div>
  </div>
}

function Random({onClose}) {
  const [quotes, setQuotes] = useState(null);
  useEffect(() => {
    getQuotes().then(quotes => setQuotes(quotes)); 
  }, []);
  return <div className={css({flex: 1, position: 'absolute',
                              top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white'})}>
    {renderRandom(quotes)}
    <Button onClick={onClose}>
    Close
    </Button>
  </div>
}

function QuoteForm({onSubmit, data={}}) {
  const [speaker, setSpeaker] = useState(data.speaker || '');
  const [context, setContext] = useState(data.context || '');
  const [secondSpeaker, setSecondSpeaker] = useState(data.secondSpeaker || '');
  const [quote, setQuote] = useState(data.quote || '');
  const [response, setResponse] = useState(data.response || '');
  const [date, setDate] = useState(data.date || Date.now());
  const [year, setYear] = useState(data.year || new Date().getFullYear());
  return <div className={css({flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: 20})}>
    <TextField autoFocus value={speaker} onChange={evt => {
        setSpeaker(evt.target.value)
      }} label="Speaker" />
    <TextField multiline value={context} onChange={evt => {
        setContext(evt.target.value)
      }} label="Context" />
    
    <TextField multiline value={quote} onChange={evt => {
        setQuote(evt.target.value)
      }} label="Quote" />
    
    <TextField value={secondSpeaker} onChange={evt => {
        setSecondSpeaker(evt.target.value)
      }} label="Second Speaker" />
    
    <TextField multiline value={year + ''} onChange={evt => {
        setYear(evt.target.value)
      }} label="Response" />
    
    <TextField value={response} onChange={evt => {
        setResponse(evt.target.value)
      }} label="Year" />
    
    <Button onClick={() => {
      onSubmit({speaker, context, secondSpeaker, quote, response, date})
    }}>
      Submit
    </Button>
    
  </div>
}

const getId = () => Date.now().toString(36) + Math.random().toString(36).slice(1);

function QuoteAdder() {
  const [saving, setSaving] = useState(false);
  const [saveCount, setCount] = useState(0);
  return <div>
    {saving === true ? 'Saving...' : (saving ? 'Failed to submit quote :( check your connection and try again.' : null)}
    <QuoteForm
      key={'form-' + saveCount}
    onSubmit={quote => {
      setSaving(true);
      submitQuote({...quote, id: getId()}).then(() => {
        setSaving(false)
        setCount(saveCount + 1);
      }, err => setSaving(err));
    }}/>
  </div>
}

function Home() {
  const [showRandom, setShowRandom] = useState(false);
  return <div className={css({
      flex: 1,
    })}>
    <Button onClick={() => setShowRandom(true)}>Show a random quote</Button>
    <QuoteAdder />
    {showRandom ? <Random onClose={() => setShowRandom(false)} /> : null}
  </div>
}

function App() {
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.password);
  useEffect(() => {
    if (localStorage.password) {
      check(localStorage.password).then(success => {
        setLoading(false);
        if (success) {
          setPassword(localStorage.password)
        }
      })
    }
  }, [])
  if (loading) {
    return <div className={css({
      flex: 1,
      padding: 20,
      textAlign: 'center',
    })}>Loading...</div>
  }
  if (!password) {
    return <Login onLogin={password => {
      localStorage.password = password
      setPassword(password);
    }}/>
  }
  return (
    <Home password={password} />
  );
  
}

ReactDOM.render(<App />, document.querySelector('#app'));