// @flow
import React, { useState, useEffect } from "react";
import { css } from "glamor";
import { render } from "react-dom";
import { ETIME } from "constants";

/**
Schema!

id: string,
year: string,
date: string,

QUOTE:
context: string,
dialog: Array<{speaker: string, text: string}>

DESCRIPTION:
text: string,
subjects: Array<string>,

*/

type Quote = {
  context: string,
  dialog: Array<{speaker: string, text: string}>,
}

type Description = {text: string, subjects: Array<string>}

type Entry = {
  id: string,
  year: number,
  date: number,
  quote?: Quote,
  description?: Description
};

const Binput = props => {
  const [value, setValue] = useState(props.value);
  useEffect(
    () => {
      setValue(props.value);
    },
    [props.value]
  );
  return (
    <input
      {...props}
      value={value}
      onChange={evt => setValue(evt.target.value)}
      onBlur={() => value !== props.value ? props.onChange(value) : null}
    />
  );
};

const showQuote = (quote: Quote, change) => {
  return <>
    <td>
      <Binput
        value={quote.context}
        placeholder="Context"
        onChange={context =>
          change({ ...quote, context })
        }
      />
    </td>
    <td>
      {quote.dialog.map((line, i) => (
        <div key={i}>
          <Binput
            // style={{ display: "block" }}
            value={line.speaker}
            placeholder="Speaker"
            onChange={speaker =>
              change({
                ...quote,
                dialog: quote.dialog
                  .slice(0, i)
                  .concat([{ ...line, speaker }])
                  .concat(quote.dialog.slice(i + 1))
              })
            }
          />
          <Binput
            style={{ width: "200px" }}
            value={line.text}
            placeholder="Quote"
            onChange={text =>
              change({
                ...quote,
                dialog: quote.dialog
                  .slice(0, i)
                  .concat([{ ...line, text }])
                  .concat(quote.dialog.slice(i + 1))
              })
            }
          />
          {i !== 0 ? <button
            onClick={() =>
              change({
                ...quote,
                dialog: quote.dialog
                  .slice(0, i)
                  .concat(quote.dialog.slice(i + 1))
              })
            }
          >
            remove
              </button> : null}
        </div>
      ))}
      <button
        onClick={() =>
          change({
            ...quote,
            dialog: quote.dialog.concat({ speaker: '', text: '' })
          })
        }
      >
        Add response
          </button>
    </td>
  </>

};

const showDescription = (description: Description, change) => {
  return <>
      <td>
        <Binput
          value={description.text}
          placeholder="Description"
          onChange={text =>
            change({ ...description, text })
          }
        />
      </td>
      <td>
        {description.subjects.map((subject, i) => (
          <div key={i}>
            <Binput
              // style={{ display: "block" }}
              value={subject}
              placeholder="Subject name"
              onChange={text =>
                change({
                    ...description,
                    subjects: description.subjects
                      .slice(0, i)
                      .concat([text])
                      .concat(description.subjects.slice(i + 1))
                })
              }
            />
            <button
              onClick={() =>
                change({
                    ...description,
                    subjects: description.subjects
                      .slice(0, i)
                      .concat(description.subjects.slice(i + 1))
                })
              }
            >
              remove
          </button>
          </div>
        ))}
        <button
          onClick={() =>
            change({
                ...description,
                subjects: description.subjects.concat("")
            })
          }
        >
          Add subject
      </button>
      </td>
  </>
};

const showEntry = (entry: Entry, change) => {
  return (
    <>
    <tr key={entry.id}>
      <td>
        <Binput
          type="number"
          min="1919"
          max="2019"
          value={'' + entry.year}
          onChange={year => change({ ...entry, year: parseInt(year) })}
        />
      </td>
      <td>
        <Binput
          value={new Date(entry.date).toLocaleDateString()}
          onChange={date =>
            change({ ...entry, date: new Date(date).getTime() })
          }
        />
      </td>
      {entry.description ? showDescription(entry.description, description => change({...entry, description})) : null}
      {entry.quote ? showQuote(entry.quote, quote => change({...entry, quote})) : null}
    </tr>
    <tr><td style={{height: '20px'}}></td></tr>
    </>
  );
};

// const attrs = 'id, context, dialog, year, date'.split(', ');

const showQuotes = (quotes, change) => {
  return (
    <table>
      <thead>
        <tr>
          {['year', 'date', 'context/description', 'dialog/subjects'].map(attr => (
            <th key={attr}>{attr}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {quotes.map((data, i) => showEntry(data, data => change(quotes.slice(0, i).concat([data]).concat(quotes.slice(i + 1)))))}
      </tbody>
    </table>
  );
};

const View = ({ password, go }) => {
  const [quotes, setQuotes] = useState(null);
  useEffect(() => {
    fetch("/quotes", { headers: { Authentication: "Bearer " + password } })
      .then(res => res.json())
      .then(setQuotes, err => setQuotes("failed"));
  }, []);
  if (quotes === null) {
    return "loading";
  }
  if (quotes === "failed") {
    return "bad password";
  }
  return showQuotes(quotes, setQuotes);
};

const getId = () =>
  Date.now().toString(36) +
  Math.random()
    .toString(36)
    .slice(1);

const toRows = text => text
    .split("\n")
    .map(line => line.split(/\t/g));
    

const parseBulk = rows => {
  const lines = rows.map(items => {
      const row: any = { id: getId() };
      const attrs = 'id, speaker, context, quote, secondSpeaker, response, year, date'.split(', ');
      attrs.slice(1).forEach((attr, i) => {
        let v = items[i] || "";
        if (attr === "date") {
          v = v ? new Date(v).getTime() : Date.now();
        }
        row[attr] = v;
      });
      const data: Entry = {id: getId(), year: row.year, date: row.date}
      if (row.context && !row.quote) {
        data.description = {
          text: row.context,
          subjects: row.speaker ? [row.speaker] : [],
        }
      } else {
        data.quote = {
          context: row.context,
          dialog: [{speaker: row.speaker, text: row.quote}].concat(row.secondSpeaker ? [{speaker: row.secondSpeaker, text: row.response}] : [])
        }
      }

      return data;
    });
  return lines;
};

const Insert = ({ password, go }) => {
  const [data, setData] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <textarea value={data}
      onPaste={evt => {
        if (evt.clipboardData.types.includes('text/html')) {
          evt.preventDefault();
          evt.stopPropagation();
          const data = evt.clipboardData.getData('text/html')
          const node = document.createElement('div')
          node.innerHTML = data
          const rows = [...node.querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent))
          setQuotes(parseBulk(rows))
        }
      }}
      onChange={evt => {
        setData(evt.target.value)
        setQuotes(parseBulk(toRows(evt.target.value)))
      }} />
      {loading === true
        ? "Loading..."
        : loading === "error"
        ? "Failed :("
        : null}
      <button
        onClick={evt => {
          setLoading(true);
          fetch("/quotes/bulk", {
            method: "POST",
            headers: {
              Authentication: "Bearer " + password,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(quotes)
          }).then(
            res =>
              res.status === 204 ? setLoading(false) : setLoading("error"),
            err => setLoading("error")
          );
        }}
      >
        Insert
      </button>
      {showQuotes(quotes, setQuotes)}
    </div>
  );
};

const Admin = () => {
  const [password, setPassword] = useState("");
  const [route, go] = useState(null);

  return (
    <div>
      <input
        onChange={evt => setPassword(evt.target.value)}
        value={password}
        placeholder="password"
      />
      <button onClick={() => go("view")}>Show All</button>
      <button onClick={() => go("insert")}>Bulk Insert</button>
      {route === "view" ? (
        <View password={password} go={go} />
      ) : route === "insert" ? (
        <Insert password={password} go={go} />
      ) : null}
    </div>
  );
};

const node = document.getElementById("admin")
if (node) {
  render(<Admin />, node);
}
