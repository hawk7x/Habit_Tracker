import React from 'react';
import './Quote.css';

function Quote() {
  const [quote, setQuote] = React.useState({ text: '', author: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    setError(false);
    try {
      const randomParam = Math.random();
      const res = await fetch(
        'https://api.allorigins.win/get?url=' +
          encodeURIComponent('https://zenquotes.io/api/random') +
          `?r=${randomParam}`
      );
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const quoteData = JSON.parse(data.contents);

      setQuote({ text: quoteData[0].q, author: quoteData[0].a });
    } catch (err) {
      console.error(err);
      setError(true);
      setQuote({
        text: 'Success is not final, failure is not fatal.',
        author: 'Winston Churchill',
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="quote-container">
      {loading ? (
        <p className="quote-text">Loading...</p>
      ) : (
        <>
          {error && <p className="quote-error">Failed to load, showing fallback</p>}
          <p className="quote-text">“{quote.text}”</p>
          <p className="quote-author">— {quote.author}</p>
        </>
      )}
      <button className="new-quote-btn" onClick={fetchQuote}>
        New Quote
      </button>
    </div>
  );
}

export default Quote;
