import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { css } from "glamor";
import {XIcon, ArrowNext} from './autocomplete-components'

import people from '../private/people'
import images from './images'

const check = password =>
  fetch("/check", { headers: { Authentication: "Bearer " + password } }).then(
    res => res.status === 204
  );
const getQuotes = () =>
  fetch("/quotes", {
    headers: { Authentication: "Bearer " + localStorage.password }
  }).then(res => res.json());
const submitQuote = quote =>
  fetch("/quotes", {
    method: "PUT",
    body: JSON.stringify(quote),
    headers: {
      "Content-Type": "application/json",
      Authentication: "Bearer " + localStorage.password
    }
  }).then(res => {
    if (res.status !== 204) {
      throw new Error("Invalid response: " + res.status);
    }
  });

function Login({ onLogin }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  return (
    <div className={css({ padding: 20 })}>
      <TextField
        autoFocus
        error={error}
        value={value}
        onChange={evt => {
          setValue(evt.target.value);
          setError(false);
        }}
        placeholder="Enter password"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          check(value).then(success => {
            if (success) {
              onLogin(value);
            } else {
              setError(true);
            }
          });
        }}
      >
        Login
      </Button>
    </div>
  );
}

const choose = items => items[(Math.random() * items.length) | 0]

const getImage = speaker => {
  const name = people.aliases[speaker] || speaker;
  if (images.people[name]) {
    return '/images/' + choose(images.people[name])
  }
  return choose(images.splash)
};

const renderQuote = (quote, entry) => {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: 'column' }}>
      {quote.dialog.map((line, i) => (
        <div
          style={{
            flex: 1,
            backgroundColor: "#afa",
            backgroundImage: `url("${getImage(line.speaker)}")`,
            backgroundPosition: 'center',
            backgroundSize: "cover",
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              color: "white",
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: "4px 8px",
              alignSelf: 'flex-start',
            }}
          >
            {line.speaker + (i === 0 ? ', ' + entry.year : '')}
          </div>
          {i === 0 && quote.context && <div style={{
            color: 'white',
            backgroundColor: "rgba(100,100,100,0.6)",
            padding: "4px 8px",
            marginTop: '8px',
            fontStyle: "italic",
            alignSelf: 'flex-end',
          }}>{quote.context}</div>}
          <div style={{
              backgroundColor: "rgba(255,255,255,0.8)",
              borderRadius: 3,
              padding: "4px 8px",
              margin: '16px',
              fontSize: '32px',
              alignSelf: ['flex-start', 'flex-end', 'center'][Math.random() * 3 | 0]
          }}>{line.text}</div>
        </div>
      ))}
    </div>
  );
};

const renderDescription = description => {
  return (
    <div>
      {description.text}
      <br />
      About {description.subjects.join(" and ")}
    </div>
  );
};

const renderEntry = entry => {
  return (
    <div key={entry.id} style={{display: 'flex', flexDirection: 'column', flex: 1}}>
      {entry.quote && renderQuote(entry.quote, entry)}
      {entry.description && renderDescription(entry.description)}
    </div>
  );
};

function ShowQuote({ onClose, onNext, quote }) {
  return (
    <div
      className={css({
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "white",
        display: 'flex',
        flexDirection: 'column'
      })}
    >
      {renderEntry(quote)}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}>

      <button onClick={onClose} style={{
        border: 'none',
        backgroundColor: 'rgba(0,0,0,0.5)',
        cursor: 'pointer',
        padding: '24px',
      }}>
        <XIcon stroke="white" strokeWidth="3px"/>
      </button>
      <button onClick={onNext} style={{
        border: 'none',
        backgroundColor: 'rgba(0,0,0,0.5)',
        cursor: 'pointer',
        padding: '24px',
      }}>
        <ArrowNext stroke="white" strokeWidth="3px"/>
      </button>
      </div>
    </div>
  );
}

function QuoteForm({ onSubmit, data = {} }) {
  const [speaker, setSpeaker] = useState(data.speaker || "");
  const [context, setContext] = useState(data.context || "");
  const [secondSpeaker, setSecondSpeaker] = useState(data.secondSpeaker || "");
  const [quote, setQuote] = useState(data.quote || "");
  const [response, setResponse] = useState(data.response || "");
  const [date, setDate] = useState(data.date || Date.now());
  const [year, setYear] = useState(data.year || new Date().getFullYear());
  return (
    <div
      className={css({
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        padding: 20
      })}
    >
      <TextField
        autoFocus
        value={speaker}
        onChange={evt => {
          setSpeaker(evt.target.value);
        }}
        label="Speaker"
      />
      <TextField
        multiline
        value={context}
        onChange={evt => {
          setContext(evt.target.value);
        }}
        label="Context"
      />

      <TextField
        multiline
        value={quote}
        onChange={evt => {
          setQuote(evt.target.value);
        }}
        label="Quote"
      />

      <TextField
        value={secondSpeaker}
        onChange={evt => {
          setSecondSpeaker(evt.target.value);
        }}
        label="Second Speaker"
      />

      <TextField
        multiline
        value={year + ""}
        onChange={evt => {
          setYear(evt.target.value);
        }}
        label="Response"
      />

      <TextField
        value={response}
        onChange={evt => {
          setResponse(evt.target.value);
        }}
        label="Year"
      />

      <Button
        onClick={() => {
          onSubmit({ speaker, context, secondSpeaker, quote, response, date });
        }}
      >
        Submit
      </Button>
    </div>
  );
}

const getId = () =>
  Date.now().toString(36) +
  Math.random()
    .toString(36)
    .slice(1);

function QuoteAdder() {
  const [saving, setSaving] = useState(false);
  const [saveCount, setCount] = useState(0);
  return (
    <div>
      {saving === true
        ? "Saving..."
        : saving
        ? "Failed to submit quote :( check your connection and try again."
        : null}
      <QuoteForm
        key={"form-" + saveCount}
        onSubmit={quote => {
          setSaving(true);
          submitQuote({ ...quote, id: getId() }).then(
            () => {
              setSaving(false);
              setCount(saveCount + 1);
            },
            err => setSaving(err)
          );
        }}
      />
    </div>
  );
}

function Home() {
  const [showQuote, setQuote] = useState(null);
  const [quotes, setQuotes] = useState(null);
  const [seen, setSeen] = useState([]);
  useEffect(() => {
    getQuotes().then(quotes => {
      const byId = {}
      quotes.forEach(q => byId[q.id] = q)
      setQuotes(byId)
      if (location.search.slice(1)) {
        const id = location.search.slice(1);
        if (byId[id]) {
          setQuote(byId[id])
        }
      }
    });
  }, []);

  const getRandom = (tries) => {
    const id = choose(Object.keys(quotes))
    if(seen.includes(id)) {
      if (tries == 0) {
        setSeen([])
        return id
      }
      return getRandom(tries - 1)
    } else {
      setSeen(seen.concat([id]))
      return id
    }
  };

  return (
    <div
      className={css({
        flex: 1
      })}
    >
      <Button onClick={() => {
        const id = getRandom(30)
        setQuote(quotes[id])
        history.pushState(null, null, '?' + id)
      }}>Show a random quote</Button>
      <QuoteAdder />
      {showQuote ? <ShowQuote quote={showQuote} onClose={() => {
        setQuote(null)
        history.pushState(null, null, '/')
      }} onNext={() => {
        const id = getRandom(30)
        setQuote(quotes[id])
        history.pushState(null, null, '?' + id)
      }} /> : null}
    </div>
  );
}

function App() {
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.password);
  useEffect(() => {
    if (localStorage.password) {
      check(localStorage.password).then(success => {
        setLoading(false);
        if (success) {
          setPassword(localStorage.password);
        }
      });
    }
  }, []);
  if (loading) {
    return (
      <div
        className={css({
          flex: 1,
          padding: 20,
          textAlign: "center"
        })}
      >
        Loading...
      </div>
    );
  }
  if (!password) {
    return (
      <Login
        onLogin={password => {
          localStorage.password = password;
          setPassword(password);
        }}
      />
    );
  }
  return <Home password={password} />;
}

ReactDOM.render(<App />, document.querySelector("#app"));
