import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { css } from "glamor";
import Autocomplete from "./autocomplete";
import people from "../private/people";

const BInput = props => {
  const [value, setValue] = useState(props.value);
  useEffect(
    () => {
      setValue(props.value);
    },
    [props.value]
  );
  return (
    <TextField
      {...props}
      value={value}
      onChange={evt => setValue(evt.target.value)}
      onBlur={() => value !== props.value ? props.onChange(value) : null}
    />
  );
};

const submitEntry = quote =>
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

const showDialog = (dialog, onChange) => {
  return (
    <div style={{paddingTop: '16px'}}>
      {dialog.map((item, i) => (
        <div key={i} style={{marginBottom: '16px'}}>
          <div style={{textAlign: 'center', display: 'block'}}>

            <strong >Quote line {i + 1}</strong>
            {i !== 0 && <Button onClick={() => {
              onChange(
                dialog
                  .slice(0, i)
                  .concat(dialog.slice(i + 1))
              )

            }}>Remove</Button>}
          </div>
          <Autocomplete
            options={people}
            value={item.speaker}
            placeholder="Speaker"
            onChange={speaker =>
              onChange(
                dialog
                  .slice(0, i)
                  .concat([{ ...item, speaker }])
                  .concat(dialog.slice(i + 1))
              )
            }
          />

          <BInput
            multiline
        fullWidth
            value={item.text}
            onChange={text => {
              onChange(
                dialog
                  .slice(0, i)
                  .concat([{ ...item, text }])
                  .concat(dialog.slice(i + 1))
              )
            }}
            label="Quote"
          />

        </div>
      ))}
      <Button  onClick={() => {
        onChange(
          dialog.concat([{ speaker: '', text: '' }])
        )
      }}>Add Speaker</Button>
    </div>
  );
};

const showDescription = (description, onChange) => {
  return <div>
    <BInput
      multiline
      fullWidth
      value={description.text}
      onChange={text => {
        onChange({ ...description, text });
      }}
      label="Description"
    />
    {description.subjects.map((subject, i) => (
      <Autocomplete key={i}
        value={subject}
        options={people}
        placeholder="Subject name"
        onChange={text => onChange({...description, subjects: description.subjects.slice(0, i).concat([text]).concat(description.subjects.slice(i + 1))})}
      />
    ))}
    <Button onClick={() => onChange({...description, subjects: description.subjects.concat([''])})}
    >
      Add a subject
    </Button>

  </div>
};

const showQuote = (quote, onChange) => {
  return <div>
    <BInput
      multiline
      fullWidth
      value={quote.context}
      onChange={context => {
        onChange({ ...quote, context });
      }}
      label="Context"
    />
    {showDialog(quote.dialog, dialog => onChange({ ...quote, dialog }))}
  </div>
};

function QuoteForm({
  onSubmit,
  entry = {}
}) {
  const [mode, setMode] = useState(!!entry.description);
  const [quote, setQuote] = useState(entry.quote || {context: '', dialog: [{speaker: '', text: ''}]});
  const [description, setDescription] = useState(entry.description || {text: '', subjects: ['']});
  const [date, setDate] = useState(entry.date || Date.now());
  const [year, setYear] = useState(entry.year || new Date().getFullYear());
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: '16px',
      }}>
        <Button
          // disabled={!mode}
          variant={mode ? 'text' : 'contained'}
          color={mode ? 'default' : 'primary'}
        fullWidth
          onClick={() => {
            setMode(false)
          }}
        >
          Quote
        </Button>

        <Button
        // disabled={mode}
          variant={mode ? 'contained' : 'text'}
          color={mode ? 'primary' : 'default'}
        fullWidth
          onClick={() => {
            setMode(true)
          }}
        >
          Description
        </Button>

      </div>

      {mode ? showDescription(description, setDescription) : showQuote(quote, setQuote)}

      <Button
        onClick={() => {
          if (mode) {
            onSubmit({date, year, description})
          } else {
            onSubmit({date, year, quote})
          }
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

export default function QuoteAdder({showQuote}) {
  const [saving, setSaving] = useState(false);
  const [saveCount, setCount] = useState(0);
  return (
    <div style={{
      flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      {saving === true
        ? "Saving..."
        : saving
        ? "Failed to submit quote :( check your connection and try again."
        : null}
      <QuoteForm
        key={"form-" + saveCount}
        onSubmit={entry => {
          setSaving(true);
          const id = getId() 
          submitEntry({ ...entry, id }).then(
            () => {
              setSaving(false);
              setCount(saveCount + 1);
              showQuote(id)
            },
            err => setSaving(err)
          );
        }}
      />
    </div>
  );
}
