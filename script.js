//KIARIE NGIGI
const apikey = '8e60cd01c1b53ceb677d9d27e5f1b160'
let weather = null
const now = Date.now()
let currentEffect = null

const head_text = document.getElementById('main_city_text')
const dash_temp = document.getElementById('dash_temp')
const dash_humidity = document.getElementById('dash_humidity')
const dash_wind = document.getElementById('dash_wind')
const loc_country = document.getElementById('loc_country')
const loc_city = document.getElementById('loc_city')
const loc_condition = document.getElementById('loc_condition')
const loc_temp = document.getElementById('loc_temp')
const main_dash_txt = document.getElementById('main_dash_txt')
const cityform = document.getElementById('search_bar')
const newloc = document.getElementById('location_box')

let count = 0;

const locationInput = document.getElementById('location_box');
const autocompleteList = document.getElementById('autocomplete_list');

locationInput.addEventListener('input', async () => {
  const query = locationInput.value.trim();
  autocompleteList.innerHTML = '';
  if (!query) return;

  try {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apikey}`);
    const results = await res.json();

    if (results.length === 0) {
  return;
}

    results.slice(0, 5).forEach(city => {
      const li = document.createElement('li');
      li.textContent = `${city.name}, ${city.country}`;
      li.addEventListener('click', () => {
        locationInput.value = city.name;
        autocompleteList.innerHTML = '';
        fetchCityWeather(city.name);
      });
      autocompleteList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
  }
});

// Allow submitting any typed city
cityform.addEventListener('submit', e => {
  e.preventDefault();
  const city = locationInput.value.trim();
  if (!city) return;
  fetchCityWeather(city);
  locationInput.value = '';
});

document.addEventListener('click', e => {
  if (!locationInput.contains(e.target)) {
    autocompleteList.innerHTML = '';
  }
});

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function create_loc(data) {
  const container    = document.getElementById("loc_cards");
  const page         = document.getElementById("page_selector");
  const main_page_ctrl = document.getElementById("scrollList");

  if (count < 3) {
    // small card
    let icon
    if(data.weather[0].main === "Clear"){
        icon = `<i class="fa-solid fa-sun fs-5"></i>`
    } else if(data.weather[0].main === "Clouds"){
        icon = `<i class="fa-solid fa-cloud"></i>`
    } else if(data.weather[0].main === "Rain"){
        icon = `<i class="fa-solid fa-cloud-sun-rain"></i>`
    } else if(data.weather[0].main === "Squall"){
        icon = `<i class="fa-solid fa-wind"></i>`
    } else{
        icon = `<i class="fa-solid fa-fire"></i>`
    }
    const card = document.createElement("div");
    card.className = "location_card text-white py-2 px-3";
    card.innerHTML = `
      <div class="location_name">
        <h3 class="fs-6 fw-light mb-1">${data.sys.country}</h3>
        <h2 class="fs-4 m-0">${data.name}</h2>
        <h3 class="fs-6 fw-light m-0">${capitalizeFirst(data.weather[0].description)}</h3>
      </div>
      <div class="temp_1 d-flex align-items-center gap-2">
        <h1 class="fw-medium m-0">${Math.round(data.main.temp - 273.15)}°C</h1>
        ${icon}
      </div>`;
    container.appendChild(card);
    

    // page dot
    const page_dot = document.createElement("button");
    page_dot.className = "page_button";
    page_dot.setAttribute("aria-label", `Page ${count + 1}`);
    page_dot.setAttribute("disabled", "true")
    page.appendChild(page_dot);
    

    // main dash
    const main_dash = document.createElement("li");
    main_dash.className = "list_item";
    main_dash.setAttribute('data-weather', data.weather[0].main)
    main_dash.setAttribute("data-city", data.name)
    main_dash.innerHTML = `
      <div class="main_dash text-white p-md-5 p-3 ">
        <div class="location d-flex align-items-center gap-3 mb-2">
          <i class="fa-solid fa-location-dot"></i>
          <h2 class="fw-light mb-0">${data.sys.country}</h2>
        </div>
        <h1 class="temp">${Math.round(data.main.temp - 273.15)}°C</h1>
        <div class="extra_info d-flex gap-4 mt-2">
          <div class="humidity d-flex align-items-center gap-2">
            <i class="fa-solid fa-droplet"></i>
            <h3 class="fw-light mb-0">${data.main.humidity}%</h3>
          </div>
          <div class="wind d-flex align-items-center gap-2">
            <i class="fa-solid fa-wind"></i>
            <h3 class="fw-light mb-0">${data.wind.speed} kph</h3>
          </div>
        </div>
      </div>`;

    
    main_page_ctrl.appendChild(main_dash);
    observer.observe(main_dash);  
    setBackground(data.weather[0].main, main_dash)
    setupLocationClicks()

    main_dash.scrollIntoView({
        behavior: "smooth",
        block: "end"
    })
    count++;
  }
}

// Current location
async function getCoords() {
  try {
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 15000 })
    );

    const { latitude: lat, longitude: lon } = pos.coords;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}`
    );
    const data = await res.json();
    create_loc(data);

  } catch (err) {
    console.warn("Location denied or failed, defaulting to Nairobi.", err);

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Nairobi&appid=${apikey}`
    );
    const data = await res.json();
    create_loc(data);
  }
}


async function fetchCityWeather(cityName) {
  try {
    // Get geo info
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apikey}`);
    const [info] = await geoRes.json();
    if (!info) return alert("City not found");

    // Fetch weather
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${info.lat}&lon=${info.lon}&appid=${apikey}`);
    const data = await res.json();
    create_loc(data);
  } catch (err) {
    console.error("Error fetching weather data", err);
  }
}

getCoords();

//WEATHER EFFECTS
let pagebtns 
class Weathereffect{
    constructor(canvasid, count = 400){
        this.canvas = document.getElementById(canvasid)
        this.ctx = this.canvas.getContext('2d')
        this.count = count 
        this.particles = []
        this.resize = this.resize.bind(this)
        window.addEventListener('resize', this.resize)
        this.resize()
    }
    resize(){
        this.canvas.width = innerWidth
        this.canvas.height = innerHeight
    }
    start(){
        this.createParticles()
        this.draw();
    }
    stop(){
        if (this.frameId) cancelAnimationFrame(this.frameId)
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
    }
}


class RainyWeather extends Weathereffect{
    createParticles(){
        this.particles = []
        for (let i = 0; i < this.count; i++){
            const angle = -0.2 + Math.random() * (-0.5)
            const speed = 4 + Math.random() * 10

            this.particles.push({
                x: Math.random() * innerWidth, 
                y: Math.random() * innerHeight, 
                len: 10 + Math.random() * 20, 
                vx: 0,
                vy: speed, 
                thickness: 0.8 + Math.random() * 1.5, 
                alpha: 0.3 + Math.random() * 0.7
            })
        }
    }
    draw = () => {
        const ctx = this.ctx
        ctx.clearRect(0,0,innerWidth,innerHeight)
        ctx.lineCap = 'round'

        for (const d of this.particles){
            ctx.strokeStyle = `rgba(173,216,230,${d.alpha})`
            ctx.lineWidth = d.thickness
            ctx.beginPath(); 
            ctx.moveTo(d.x, d.y)
            ctx.lineTo(d.x + d.len * d.vx, d.y + d.len)
            ctx.stroke()
            d.x += d.vx
            d.y += d.vy

            if (d.y > innerHeight + 20){
                d.x = Math.random() * innerWidth
                d.y = -20
            }
        }
        this.frameId = requestAnimationFrame(this.draw)
    }
}
class WindyWeather extends Weathereffect{
    createParticles(){
        this.particles = []
        for (let i = 0; i < this.count; i++){
            const angle = Math.random() * 0.2 - 0.1
            const speed = 4 + Math.random() * 4

            this.particles.push({
                x: Math.random() * innerWidth, 
                y: Math.random() * innerHeight, 
                size: 2 + Math.random() * 2,
                vx: 0.5 + Math.cos(angle) * speed * 0.5,
                vy: Math.sin(angle) * speed * 0.5, 
                alpha: 0.4 + Math.random() * 0.6
            })
        }
    }
    draw = () => {
        const ctx = this.ctx
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,innerWidth,innerHeight)
        ctx.fillStyle = 'rgba(255,255,255,0.6)'

        for (const p of this.particles){
            ctx.globalAlpha = p.alpha
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2) 
            ctx.fill()
            p.x += p.vx
            p.y += p.vy

            if (p.y > innerHeight + 20){
                p.x = -20
                p.y = Math.random() * innerHeight
            }
        }
        ctx.globalAlpha = 1
        this.frameId = requestAnimationFrame(this.draw)
    }
}

const sunny_img = [
    "url(./Photos/Sunny/blind-hk-ruy4SPfg-unsplash.jpg')", 
    "url(./Photos/Sunny/jacob-dub-sgPiBo1oGUg-unsplash.jpg')", 
    "url(./Photos/Sunny/jan-huber-yGOClW3KdKk-unsplash.jpg')",
    "url(./Photos/Sunny/nareeta-martin-7Lk2Jjj4xb4-unsplash.jpg')"
]
const cloud_img = [
    "url(./Photos/Cloud/ahmet-yuksek-MuB8snLj2xQ-unsplash.jpg')",
    "url(./Photos/Cloud/daniil-silantev-3pW91fGAKiE-unsplash.jpg')",
    "url(./Photos/Cloud/marek-piwnicki-e0mY8yx2SYY-unsplash.jpg')",
    "url(./Photos/Cloud/subhadeep-dishant-zOKJbvnhhnA-unsplash.jpg')"
]
const rain_img = [
    "url(./Photos/Rainy/haiane-madoian-WdgxK2rbJeM-unsplash.jpg')",
    "url(./Photos/Rainy/hasnan-monir-RI9thYGcroA-unsplash.jpg')",
    "url(./Photos/Rainy/james-coleman-tmiN6tdlw0U-unsplash.jpg')",
    "url(./Photos/Rainy/k8-JZU3aJ_wFiQ-unsplash.jpg')"
]
const wind_img = [
    "url(./Photos/Windy/eddie-blair-Sc4cLY3XzLM-unsplash.jpg')",
    "url(./Photos/Windy/jean-daniel-calame-7mezG1ieOHY-unsplash.jpg')",
    "url(./Photos/Windy/michail-dementiev-mq0je_HLi9I-unsplash.jpg')",
    "url(./Photos/Windy/rafael-garcin-Rzly4i-wA94-unsplash.jpg')"
]
const generic_img = [
    "url(./Photos/Generic/daniel-sessler-IyhdFcaRYqE-unsplash.jpg')",
    "url(./Photos/Generic/emma-swoboda-rJQZ1yYo-pg-unsplash.jpg')",
    "url(./Photos/Generic/marek-piwnicki-Qoe1RbKPzMo-unsplash.jpg')",
    "url(./Photos/Generic/steve-gribble-ZDw4bMLSUXA-unsplash.jpg')"
]

let randomIndex = Math.floor(Math.random() * sunny_img.length) ;  
const bg = document.querySelector('.background_img');

function setBackground(weather, dashE1) {
    if (currentEffect) {
    currentEffect.stop();
    currentEffect = null;
  }

  let img;
  
  if (weather === "Clear") {
    bg.style.setProperty('--bg-img', sunny_img[randomIndex]);
    sunny_weather(dashE1)
}
  else if (weather === "Clouds") bg.style.setProperty('--bg-img', cloud_img[randomIndex]);
  else if (weather === "Rain") {
    bg.style.setProperty('--bg-img', rain_img[randomIndex]);
    currentEffect = new RainyWeather('c');
    currentEffect.start();
  } 
  else if (weather === "Squall") {
    bg.style.setProperty('--bg-img', wind_img[randomIndex]);
    currentEffect = new WindyWeather('c');
    currentEffect.start();
  } 
  else img = generic_img[randomIndex];
  
}


function sunny_weather(dashE1){
    //const main = document.querySelector('.main_dash')
    dashE1.style.setProperty('background', 'radial-gradient(ellipse at bottom right, #9E1A01 6%, #F07B1E 21%, #EED38C 40%,  transparent 100%)')
    dashE1.style.setProperty('animation', 'pulse 6s ease-in-out infinite')
}

function observeInitialElements() {
    const initialItems = document.querySelectorAll('.list_item')
    initialItems.forEach(item => observer.observe(item))
}

const observerOptions = {
    root: document.getElementById('scrollList'), 
    threshold: [0.5,0.8], 
    rootMargin: '-10% 0px -10% 0px'
}

const list = document.getElementById('scrollList')

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const items = Array.from(document.querySelectorAll('.list_item'));
                const index = items.indexOf(entry.target);
                const weatherType = entry.target.dataset.weather;
                const cityName = entry.target.dataset.city;
                
                // Update background and city name
                setBackground(weatherType, entry.target);
                head_text.textContent = cityName.toUpperCase();
                
                // Update active state of dots
                setActive(index);
            }
        });
    },
    {
        root: document.getElementById('scrollList'),
        threshold: 0.6,
        rootMargin: '-10% 0px'
    }
);

// Start observing each item
const allitems = document.querySelectorAll('.list_item');
allitems.forEach(item => observer.observe(item));


function setActive(index){
    const pagebtns = document.querySelectorAll('.page_button')
    
    pagebtns.forEach((dot, i) => {
        dot.classList.toggle('active', i === index)
    })
}

function setupLocationClicks() {
    const sidecards = document.querySelectorAll('.location_card');
    const items = document.querySelectorAll('.list_item');

    sidecards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const targetItem = items[index];
            if (targetItem) {
                setActive(index);
                
                // Scroll into view 
                const scrollList = document.getElementById('scrollList');
                const itemTop = targetItem.offsetTop;
                scrollList.scrollTo({
                    top: itemTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupLocationClicks()
    observeInitialElements()
})
















