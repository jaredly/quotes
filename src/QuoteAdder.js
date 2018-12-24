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

const showDialog = (dialog, onChange) => {
  return (
    <div>
      {dialog.map((item, i) => (
        <div key={i}>
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
    </div>
  );
};

function QuoteForm({
  onSubmit,
  date: origDate,
  year: origYear,
  quote = { dialog: [{ speaker: "", text: "" }], context: "" }
}) {
  const [dialog, setDialog] = useState(
    quote.dialog || [{ speaker: "", text: "" }]
  );
  const [context, setContext] = useState(quote.context || "");
  const [date, setDate] = useState(origDate || Date.now());
  const [year, setYear] = useState(origYear || new Date().getFullYear());
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
        multiline
        fullWidth
        value={context}
        onChange={evt => {
          setContext(evt.target.value);
        }}
        label="Context"
      />
      {showDialog(dialog, setDialog)}

      <TextField
        value={year}
        onChange={evt => {
          setYear(evt.target.value);
        }}
        label="Year"
      />

      <Button
        onClick={() => {
          onSubmit({ context, dialog, date });
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

export default function QuoteAdder() {
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
