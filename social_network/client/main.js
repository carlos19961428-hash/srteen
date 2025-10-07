// Client-side script for SRTEEN demo.
//
// This script loads translations from the backend and populates the UI
// accordingly. It also fetches demo feed data for shorts and live streams.

(() => {
  let currentLang = 'en';
  let translations = {};

  const titleEl = document.getElementById('title');
  const selectLabelEl = document.getElementById('selectLanguageLabel');
  const languageSelect = document.getElementById('languageSelect');
  const feedShortsHeadingEl = document.getElementById('feedShortsHeading');
  const feedLiveHeadingEl = document.getElementById('feedLiveHeading');
  const feedShortsContainer = document.getElementById('feedShorts');
  const feedLiveContainer = document.getElementById('feedLive');

  // Determine if a language is right‑to‑left (currently only Arabic).
  function isRTL(lang) {
    return ['ar', 'he', 'fa', 'ur'].includes(lang);
  }

  // Load translations for the specified language from the backend.
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`http://localhost:3000/api/translations?lang=${lang}`);
      if (response.ok) {
        translations = await response.json();
      } else {
        translations = {};
      }
    } catch (err) {
      console.error('Failed to load translations:', err);
      translations = {};
    }
  }

  // Populate the UI with the loaded translations.
  function updateUI() {
    titleEl.textContent = translations.appTitle || 'SRTEEN Social Network';
    selectLabelEl.textContent = translations.selectLanguage || 'Select Language';
    feedShortsHeadingEl.textContent = translations.feedShortsHeading || 'Short Videos';
    feedLiveHeadingEl.textContent = translations.feedLiveHeading || 'Live Streams';
    // Adjust text direction for RTL languages.
    document.body.dir = isRTL(currentLang) ? 'rtl' : 'ltr';
  }

  // Render an array of feed items into a container. Uses the translation key
  // "postBy" to format each item.
  function renderFeedItems(items, container) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      const noFeedMsg = document.createElement('p');
      noFeedMsg.textContent = translations.noFeed || 'No feed available';
      container.appendChild(noFeedMsg);
      return;
    }
    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = container === feedShortsContainer ? 'feed-item' : 'live-item';
      // Format the date in a more readable form.
      const dateStr = new Date(item.posted_at || item.started_at).toLocaleString(currentLang);
      const author = item.author || item.streamer || '';
      // Replace placeholders in the "postBy" string.
      let postBy = (translations.postBy || 'Posted by {{author}} on {{date}}')
        .replace(/{{\s*author\s*}}/g, author)
        .replace(/{{\s*date\s*}}/g, dateStr);
      const title = item.description || item.title || '';
      div.innerHTML = `<strong>${title}</strong><br/><small>${postBy}</small>`;
      container.appendChild(div);
    });
  }

  // Fetch feed data from the backend and render it.
  async function loadFeed() {
    try {
      // Load shorts feed
      const shortsResponse = await fetch('http://localhost:3000/api/feed/shorts');
      const shortsData = await shortsResponse.json();
      renderFeedItems(shortsData, feedShortsContainer);
      // Load live feed
      const liveResponse = await fetch('http://localhost:3000/api/feed/live');
      const liveData = await liveResponse.json();
      renderFeedItems(liveData, feedLiveContainer);
    } catch (err) {
      console.error('Failed to load feed:', err);
    }
  }

  // Handler for language selection change.
  languageSelect.addEventListener('change', async (event) => {
    currentLang = event.target.value;
    await loadTranslations(currentLang);
    updateUI();
    // Reload feed to update date formatting based on language.
    await loadFeed();
  });

  // Initial load on page startup.
  async function init() {
    await loadTranslations(currentLang);
    updateUI();
    await loadFeed();
  }

  init();
})();