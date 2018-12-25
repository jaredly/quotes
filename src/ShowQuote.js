import React from "react";
import { css } from "glamor";
import { XIcon, ArrowNext } from "./autocomplete-components";

import people from "../private/people";
import images from "./images";


export const choose = items => items[(Math.random() * items.length) | 0];

const getImage = speaker => {
  speaker = speaker && speaker.trim();
  const name = people.aliases[speaker] || speaker;
  if (images.people[name]) {
    return "/images/" + choose(images.people[name]);
  }
  return choose(images.splash);
};

const renderQuote = (quote, entry) => {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {quote.dialog.map((line, i) => (
        <div
          style={{
            flex: 1,
            backgroundColor: "#afa",
            backgroundImage: `url("${getImage(line.speaker)}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              color: "white",
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: "4px 8px",
              alignSelf: "flex-start"
            }}
          >
            {line.speaker + (i === 0 ? ", " + entry.year : "")}
          </div>
          {i === 0 && quote.context && (
            <div
              style={{
                color: "white",
                backgroundColor: "rgba(100,100,100,0.6)",
                padding: "4px 8px",
                marginTop: "8px",
                fontStyle: "italic",
                alignSelf: "flex-end"
              }}
            >
              {quote.context}
            </div>
          )}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.8)",
              borderRadius: 3,
              padding: "4px 8px",
              margin: "16px",
              fontSize: "32px",
              alignSelf: ["flex-start", "flex-end", "center"][
                (Math.random() * 3) | 0
              ]
            }}
          >
            {line.text}
          </div>
        </div>
      ))}
    </div>
  );
};

const renderDescription = description => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#afa",
        backgroundImage: `url("${getImage(description.subjects[0])}")`,

        backgroundPosition: "center",
        backgroundSize: "cover",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          color: "white",
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: "4px 8px",
          alignSelf: "flex-start"
        }}
      >
        About {description.subjects.join(" and ")}
      </div>
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.8)",
          borderRadius: 3,
          padding: "4px 8px",
          margin: "16px",
          fontSize: "32px",
          alignSelf: ["flex-start", "flex-end", "center"][
            (Math.random() * 3) | 0
          ]
        }}
      >
        {description.text}
      </div>
    </div>
  );
};

const renderEntry = entry => {
  return (
    <div
      key={entry.id}
      style={{ display: "flex", flexDirection: "column", flex: 1 }}
    >
      {entry.quote && renderQuote(entry.quote, entry)}
      {entry.description && renderDescription(entry.description)}
    </div>
  );
};

export default function ShowQuote({ onClose, onNext, quote }) {
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
        display: "flex",
        flexDirection: "column"
      })}
    >
      {renderEntry(quote)}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0
        }}
      >
        <button
          onClick={onClose}
          style={{
            border: "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            cursor: "pointer",
            padding: "24px"
          }}
        >
          <XIcon stroke="white" strokeWidth="3px" />
        </button>
        <button
          onClick={onNext}
          style={{
            border: "none",
            backgroundColor: "rgba(0,0,0,0.5)",
            cursor: "pointer",
            padding: "24px"
          }}
        >
          <ArrowNext stroke="white" strokeWidth="3px" />
        </button>
      </div>
    </div>
  );
}
