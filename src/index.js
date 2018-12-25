import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { css } from "glamor";
import ShowQuote, {choose} from './ShowQuote'
import QuoteAdder from './QuoteAdder'


const check = password =>
  fetch("/check", { headers: { Authentication: "Bearer " + password } }).then(
    res => res.status === 204
  );
const getQuotes = () =>
  fetch("/quotes", {
    headers: { Authentication: "Bearer " + localStorage.password }
  }).then(res => res.json());

function Login({ onLogin }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  return (
    <div className={css({ padding: 20 })}>
      <TextField
        autoFocus
        autocorrect="off"
        autocapitalize="none"
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

function Home() {
  const [showQuote, setQuote] = useState(null);
  const [quotes, setQuotes] = useState(null);
  const [seen, setSeen] = useState([]);
  useEffect(() => {
    getQuotes().then(quotes => {
      const byId = {};
      quotes.forEach(q => (byId[q.id] = q));
      setQuotes(byId);
      if (location.search.slice(1)) {
        const id = location.search.slice(1);
        if (byId[id]) {
          setQuote(byId[id]);
        }
      }
    });
  }, []);

  const getRandom = tries => {
    const id = choose(Object.keys(quotes));
    if (seen.includes(id)) {
      if (tries == 0) {
        setSeen([]);
        return id;
      }
      return getRandom(tries - 1);
    } else {
      setSeen(seen.concat([id]));
      return id;
    }
  };

  return (
    <div
      className={css({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Button
        onClick={() => {
          const id = getRandom(30);
          setQuote(quotes[id]);
          history.pushState(null, null, "?" + id);
        }}
      >
        Show a random quote
      </Button>
      <QuoteAdder showQuote={id => {
        getQuotes().then(quotes => {
          const byId = {};
          quotes.forEach(q => (byId[q.id] = q));
          setQuotes(byId);
          if (byId[id]) {
            setQuote(byId[id]);
            history.pushState(null, null, "?" + id);
          }
        });
      }} />
      {showQuote ? (
        <ShowQuote
          quote={showQuote}
          onClose={() => {
            setQuote(null);
            history.pushState(null, null, "/");
          }}
          onNext={() => {
            const id = getRandom(30);
            setQuote(quotes[id]);
            history.pushState(null, null, "?" + id);
          }}
        />
      ) : null}
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
