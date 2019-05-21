import React from "react";
import {css} from 'glamor'

const mainButton = css({
  padding: '8px 16px',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  borderRadius: '4px',
  textTransform: 'uppercase',
  fontSize: '0.875rem',
  cursor: 'pointer',
  border: 'none',
  boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
  color: 'white',
  backgroundColor: '#3f51b5',
})

const flatButton = css({
  padding: '8px 16px',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  borderRadius: '4px',
  textTransform: 'uppercase',
  fontSize: '0.875rem',
  cursor: 'pointer',
  border: 'none',
  // boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
  color: 'rgba(0, 0, 0, 0.87)',
  backgroundColor: 'white',
  ':hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  }
})

export default function Button({variant, color, fullWidth, style, ...props}) {
  return <button
    {...props}
    style={{flex: fullWidth ? 1 : undefined, ...style}}
    className={variant == 'contained' ? mainButton : flatButton }
  />
}

