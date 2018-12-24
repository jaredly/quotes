import React, {useState, useEffect} from 'react'
import {css} from 'glamor'
import {render} from 'react-dom'


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

const Binput = (props) => {
  const [value, setValue] = useState(props.value);
  useEffect(() => {
    setValue(props.value);
  }, [props.value])
  return <input {...props} value={value} onChange={evt => setValue(evt.target.value)} onBlur={() => props.onChange(value)} />
};


const showEntry = (entry, change) => {
  return <tr key={entry.id}>
    <td>
      <Binput type="number" min="1919" max="2019" value={entry.year} onChange={year => change({...entry, year})} />
    </td>
    <td>
      <Binput value={new Date(entry.date).toLocaleDateString()} onChange={date => change({...entry, date: new Date(date).getTime()})} />
    </td>
    {entry.description ? <td>
      <Binput value={entry.description.text} placeholder="Description" onChange={text => change({...entry, description: {...entry.description, text}})} />
    </td> : null}
    {entry.description ? <td>
      {entry.description.subjects.map((subject, i) => (
        <div>
        <Binput style={{display: 'block'}} value={subject} placeholder="Subject name" onChange={
            text => change({...entry, description: {
             ...entry.description, subjects: entry.description.subjects.slice(0, i).concat([text]).concat(entry.description.subjects.slice(i + 1))
                           }
            })} />
        <button onClick={() => change({...entry, description: {...entry.description, subjects: entry.description.subjects.slice(0, i).concat(entry.description.subjects.slice(i+1))}})}>remove</button>
      </div>
        ))}
      <button onClick={() => change({...entry, description: {...entry.description, subjects: entry.description.subjects.concat('')}})}>Add subject</button>
    </td> : null}
    {entry.quote ? <td>
      <Binput value={entry.quote.context} placeholder="Context" onChange={context => change({...entry, quote: {...entry.quote, context}})} />
    </td> : null}
  </tr>
}


// const attrs = 'id, context, dialog, year, date'.split(', ');

const showQuotes = quotes => {
  return <table>
    <thead>
      <tr>
        {attrs.slice(1).map(attr => <th key={attr}>{attr}</th>)}
      </tr>
    </thead>
    <tbody>
    {quotes.map((data) => (
      <tr key={data.id}>
        {attrs.slice(1).map(attr => <td key={attr}>{attr === 'date' ? new Date(data[attr]).toLocaleDateString() : data[attr]}</td>)}
      </tr>
    ))}
    </tbody>
  </table>;
};

const View = ({password, go}) => {
  const [quotes, setQuotes] = useState(null);
  useEffect(() => {
    fetch('/quotes', {headers: {Authentication: 'Bearer ' + password}}).then(res => res.json()).then(setQuotes, err => setQuotes('failed'));
  }, []);
  if (quotes === null) {
    return 'loading';
  }
  if (quotes === 'failed') {
    return 'bad password'
  }
  return showQuotes(quotes)
};

const getId = () => Date.now().toString(36) + Math.random().toString(36).slice(1);

const parseBulk = text => {
  const lines = text.split('\n').map(line => line.split(/\t/g)).map(items => {
    const data = {id: getId()};
    attrs.slice(1).forEach((attr, i) => {
      let v = items[i] || '';
      if (attr === 'date') {
        v = v ? new Date(v).getTime() : Date.now();
      }
      data[attr] = v
    });
    return data
  });
  return lines
}

const Insert = ({password, go}) => {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  return <div>
    <textarea value={data} onChange={evt => setData(evt.target.value)} />
    {loading === true ? 'Loading...' : (loading === 'error' ? 'Failed :(' : null)}
    <button onClick={evt => {
        setLoading(true);
        fetch('/quotes/bulk', {method: 'POST', headers: {Authentication: 'Bearer ' + password, 'Content-Type': 'application/json'}, body: JSON.stringify(parseBulk(data))})
        .then(res => res.status === 204 ? setLoading(false) : setLoading('error'), err => setLoading('error'))
      }}>Insert</button>
    {showQuotes(parseBulk(data))}
  </div>
};

const Admin = () => {
  const [password, setPassword] = useState('')
  const [route, go] = useState(null);
  
  return <div>
    <input onChange={evt => setPassword(evt.target.value)} value={password} placeholder="password"/>
    <button onClick={() => go('view')}>
      Show All
    </button>
    <button onClick={() => go('insert')}>
      Bulk Insert
    </button>
    {route === 'view' ? <View password={password} go={go} /> : (route === 'insert' ? <Insert password={password} go={go} /> : null)}
  </div>
};



render(<Admin />, document.getElementById('admin'));
