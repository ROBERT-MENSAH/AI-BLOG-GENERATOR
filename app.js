// Shared site script for AI Blog Generator

// This constant defines the localStorage key used to store generated blog posts.
const STORAGE_KEY = 'aiBlogGeneratorPosts';

// Shortcut helper to select an element by CSS selector.
function $(selector) {
  return document.querySelector(selector);
}

// Read stored blog posts from localStorage and return them as an array.
function getStoredPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY); // read the saved JSON string
    return raw ? JSON.parse(raw) : []; // parse it or return an empty array if missing
  } catch (error) {
    console.error('Unable to read stored posts', error);
    return []; // if parsing fails, return an empty list instead of crashing
  }
}

// Save the provided posts array into localStorage as JSON.
function saveStoredPosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); // convert to JSON and save
  } catch (error) {
    console.error('Unable to save stored posts', error);
  }
}

// Create a paragraph element with consistent styling for blog content.
function formatParagraph(text) {
  const paragraph = document.createElement('p'); // create <p>
  paragraph.className = 'text-gray-700'; // apply Tailwind text color
  paragraph.textContent = text; // add the paragraph text
  return paragraph; // return the complete element
}

// Create a card element for a blog post in the blog listing page.
function createBlogCard(post) {
  const card = document.createElement('div');
  card.className = 'border border-gray-300 p-4 rounded shadow-md bg-white';

  const title = document.createElement('h3');
  title.className = 'text-xl font-bold';
  title.textContent = post.title; // add the blog title

  const excerpt = document.createElement('p');
  excerpt.className = 'text-gray-600';
  excerpt.textContent = post.excerpt; // add the blog excerpt

  const link = document.createElement('a');
  link.href = `blogdetails.html?id=${encodeURIComponent(post.id)}`; // link includes post id
  link.className = 'text-blue-600 hover:underline mt-2 inline-block';
  link.textContent = 'View details';

  card.appendChild(title); // add title to card
  card.appendChild(excerpt); // add excerpt to card
  card.appendChild(link); // add link to card

  return card; // return the finished card element
}

// Populate the "all blogs" page with stored blog cards.
function populateAllBlogs() {
  const container = $('#blogPostsContainer'); // find the blog list container
  if (!container) return; // stop if the element is not present

  const posts = getStoredPosts(); // load existing saved posts
  container.innerHTML = ''; // clear any previous content

  if (posts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'col-span-1 p-6 rounded bg-blue-50 border border-blue-200 text-blue-700';
    empty.textContent = 'No saved blog posts yet. Generate one on the home page first!';
    container.appendChild(empty); // show a friendly empty state
    return;
  }

  posts.forEach(post => container.appendChild(createBlogCard(post))); // build and add each post card
}

// Show a single blog post on the details page using the URL ?id= value.
function showBlogDetails() {
  const params = new URLSearchParams(window.location.search); // parse query string
  const id = params.get('id'); // get the id parameter
  const detailsSection = document.querySelector('section'); // find the section element
  if (!detailsSection) return; // stop if the page structure is missing

  const posts = getStoredPosts(); // load posts from storage
  const post = posts.find(item => item.id === id); // find the matching post by id

  if (!post) {
    const message = document.createElement('p');
    message.className = 'text-gray-700';
    message.textContent = 'This blog post could not be found. Please return to the home page and generate a post first.';
    detailsSection.appendChild(message); // show an error message when the post is missing
    return;
  }

  const card = document.createElement('div');
  card.className = 'border border-gray-300 p-4 rounded shadow-md bg-white';

  const title = document.createElement('h3');
  title.className = 'text-xl font-bold';
  title.textContent = post.title; // show the post title

  card.appendChild(title);
  post.paragraphs.forEach(text => card.appendChild(formatParagraph(text))); // show each paragraph

  detailsSection.appendChild(card); // add the full details card to the page
}

// Toggle the loading spinner display on the home page.
function animateLoading(show) {
  const loader = $('#loading-circle'); // find the loader element
  if (!loader) return; // if the loader is not there, do nothing
  loader.style.display = show ? 'block' : 'none'; // toggle display based on the flag
}

// Build a blog object with a unique id and metadata.
function createGeneratedBlog(title, excerpt, paragraphs) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`, // unique id using timestamp and random string
    title,
    excerpt,
    paragraphs,
    createdAt: new Date().toISOString() // ISO timestamp for creation time
  };
}

// Simulate generating a blog post based on the YouTube link.
function simulateGeneration(url) {
  const videoName = getVideoTitle(url); // derive a friendly title from the URL
  const title = `AI Blog: ${videoName}`; // create the blog title
  const excerpt = `This blog article was created automatically from the YouTube video URL you entered.`; // create the excerpt text
  const paragraphs = [
    `The video ${videoName} offers clear ideas and a strong introduction to the topic, which makes it easy for AI to convert into a readable blog article.`,
    `As an AI-generated blog, this content includes useful sections, practical tips, and an engaging tone.`,
    `You can edit the text after generation to match your own voice and add any extra details you want.`
  ];

  return createGeneratedBlog(title, excerpt, paragraphs); // return the generated blog object
}

// Extract a simple video title from a YouTube URL.
function getVideoTitle(url) {
  try {
    const parsed = new URL(url); // parse the provided link
    if (parsed.hostname.includes('youtu.be')) {
      return 'YouTube Short Video'; // short link style
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v'); // get the v= parameter
      return id ? `YouTube Video ${id}` : 'YouTube Video'; // use id if available
    }
  } catch (error) {
    return 'YouTube Video'; // fallback when URL parsing fails
  }
  return 'YouTube Video'; // default fallback if hostname doesn't match expected domains
}

// Render the generated blog on the home page after creation.
function renderGeneratedContent(post) {
  const blogContent = $('#blogContent'); // find the output container
  if (!blogContent) return; // do nothing if the container is missing
  blogContent.innerHTML = ''; // clear previous content

  const heading = document.createElement('h3');
  heading.className = 'text-2xl font-bold';
  heading.textContent = post.title; // display the generated title
  blogContent.appendChild(heading);

  const info = document.createElement('p');
  info.className = 'text-gray-600 mt-2';
  info.textContent = post.excerpt; // display the excerpt
  blogContent.appendChild(info);

  post.paragraphs.forEach(paragraph => blogContent.appendChild(formatParagraph(paragraph))); // add each paragraph element

  const detailsLink = document.createElement('a');
  detailsLink.href = `blogdetails.html?id=${encodeURIComponent(post.id)}`; // link to the details page
  detailsLink.className = 'inline-block mt-4 text-blue-600 hover:underline';
  detailsLink.textContent = 'Read full details';
  blogContent.appendChild(detailsLink); // add the details link
}

// Attach click handling for the generate button on the home page.
function handleGenerateButton() {
  const button = $('#generateBlogbutton'); // find the button
  const input = $('#youtubelink'); // find the YouTube input field
  if (!button || !input) return; // do nothing if either element is missing

  button.addEventListener('click', () => {
    const url = input.value.trim(); // get the input value and trim whitespace
    const blogContent = $('#blogContent'); // find the output area

    if (!url) {
      if (blogContent) {
        blogContent.innerHTML = '<p class="text-red-600">Please enter a YouTube link to continue.</p>'; // show validation message
      }
      return; // stop if no URL was entered
    }

    animateLoading(true); // show the loading spinner
    if (blogContent) blogContent.innerHTML = ''; // clear previous result
    button.disabled = true; // disable button while processing
    button.classList.add('opacity-50'); // show visual disabled state

    setTimeout(() => {
      animateLoading(false); // hide loader after delay
      const post = simulateGeneration(url); // create a fake blog post
      const posts = getStoredPosts(); // load existing posts
      posts.unshift(post); // add the new post to the front
      saveStoredPosts(posts); // save updated list
      renderGeneratedContent(post); // show the generated content on the page
      button.disabled = false; // re-enable button
      button.classList.remove('opacity-50'); // restore button style
    }, 1500); // simulate a 1.5 second generation delay
  });
}

// Attach submit handling for login and signup forms.
function handleForms() {
  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');

  if (loginForm) {
    loginForm.addEventListener('submit', event => {
      event.preventDefault(); // stop the form from actually submitting
      const username = loginForm.username.value.trim(); // get username
      const password = loginForm.password.value.trim(); // get password
      if (!username || !password) {
        alert('Please enter both username and password.'); // validation error
        return;
      }
      alert(`Welcome back, ${username}!`); // success feedback
      loginForm.reset(); // clear the form fields
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', event => {
      event.preventDefault(); // stop the real submit
      const email = signupForm.email.value.trim(); // gather email
      const password = signupForm.password.value.trim(); // gather password
      const confirm = signupForm.confirmPassword.value.trim(); // gather confirmation
      if (!email || !password || !confirm) {
        alert('Please fill in every field.'); // require all fields
        return;
      }
      if (password !== confirm) {
        alert('Passwords do not match.'); // password mismatch
        return;
      }
      alert('Signup successful! You can now login.'); // success feedback
      signupForm.reset(); // clear the signup form
    });
  }
}

// Initialize the site by wiring event handlers and rendering the right page sections.
function initSite() {
  handleGenerateButton(); // wire the generate button if present
  handleForms(); // wire login/signup forms if present
  populateAllBlogs(); // fill the all blogs page if present
  showBlogDetails(); // render details page if present
}

// Run initSite after the DOM has fully loaded.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}
