import React from "react";
import {css} from 'glamor'

const input = css({
  padding: '8px 16px',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: '0.875rem',
  // cursor: 'pointer',
  border: 'none',
  color: 'black',
  // boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
  // color: 'white',
  border: '1px solid #eee',
  borderBottom: '2px solid #3f51b5',
})

const errorStyle = css({
        color: 'red',
      })

export default function TextField({fullWidth, multiline, label, placeholder, error, style, ...props}) {
  if (multiline) {
    return <div>
      <div className={css({
        paddingTop: 16,
        paddingBottom: 8,

      })}>{placeholder || label}</div>
      <textarea
      {...props}
      style={{
        flex: fullWidth ? 1 : undefined,
        alignSelf: fullWidth ? 'stretch' : undefined,
        width: fullWidth ? '100%' : undefined,
        ...style}}
      className={input}
      />
      {error ? <div>{error}</div> : null}
    </div>
  }
  const main = <input
      {...props}
      placeholder={placeholder || label}
      style={{
        flex: fullWidth ? 1 : undefined,
        alignSelf: fullWidth ? 'stretch' : undefined,
        width: fullWidth ? '100%' : undefined,
        ...style}}
      className={input}
    />
  if (error) {
    return <div style={{
      flex: fullWidth ? 1 : undefined,
        alignSelf: fullWidth ? 'stretch' : undefined,
        width: fullWidth ? '100%' : undefined,
    }}>
      {main}
      <div className={errorStyle}>
        {error}
      </div>
    </div>
  }
  return main
}


