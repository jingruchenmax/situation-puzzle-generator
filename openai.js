document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('query-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const query = document.getElementById('query').value;
      const responseDiv = document.getElementById('response');
      responseDiv.innerHTML = 'Loading...';

      try {
          const response = await fetch('http://127.0.0.1:5000/query', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ query })
          });
          const data = await response.json();
          responseDiv.innerHTML = data.answer;
      } catch (error) {
          responseDiv.innerHTML = 'Error: ' + error.message;
      }
  });
});


