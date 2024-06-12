document.addEventListener('DOMContentLoaded', (event) => {
  const modal_login = document.getElementById('modal-login');
  const modal_signup = document.getElementById('modal-signup');
  const loginBtn = document.getElementById('loginBtn');
  const closeBtn = document.querySelectorAll('.close-btn');
  const q_loginBtn = document.getElementById('q-login')
  const q_signupBtn = document.getElementById('q-signup')
  const stationsContainer = document.querySelector('.stations')
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-bar input');
  const loader = document.querySelector('.loader');
  const attractionGrid = document.querySelector('.attraction-grid');
  const leftArrow = document.querySelector('.arrow-left')
  const rightArrow = document.querySelector('.arrow-right')
  const morningRadio = document.getElementById('morning')
  const afternoonRadio = document.getElementById('afternoon')
  const priceSpan = document.getElementById('price')
  const titleBtn = document.querySelector('.title')
  

  if(loginBtn) {
    loginBtn.onclick = function() {
      modal_login.style.display = "block";
    };
  }

  closeBtn.forEach(btn => {
    btn.onclick = function () {
    modal_login.style.display = "none";
    modal_signup.style.display = "none";
    }
  })

  q_loginBtn.onclick = function() {
    modal_signup.style.display = "block";
    modal_login.style.display = "none";
  }

  q_signupBtn.onclick = function() {
    modal_login.style.display = "block";
    modal_signup.style.display = "none";
  }

  if (morningRadio) {
    morningRadio.addEventListener('change', () => {
      priceSpan.textContent = '2000';
    });
  }

  if (afternoonRadio) {
    afternoonRadio.addEventListener('change', () => {
      priceSpan.textContent = '2500';
    });
  }

  titleBtn.onclick = function () {
    window.location.href ='http://13.236.156.145:8000/'
  }




  if (stationsContainer) {
    fetch('http://13.236.156.145:8000/api/mrts')
      .then(response => response.json())
      .then(data => {
        const stationNames = data.data
        stationNames.forEach(name => {
            const station = document.createElement('div');
            station.className = 'station';
            station.textContent = name;
            station.addEventListener('click', () => {
              searchInput.value = name;
              nextPage = 0;
              fetchAttractions(nextPage, true, name);
            });
            stationsContainer.appendChild(station)
        });
      })

      .catch(error => {
        console.error('Error fetching station names:', error);
      });
  }


if (searchBtn && searchInput) {
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const keyword = searchInput.value;
      nextPage = 0;
      fetchAttractions(nextPage, true, keyword); 
    }
  });

  searchBtn.addEventListener('click', () => {
    const keyword = searchInput.value;
    nextPage = 0;
    fetchAttractions(nextPage, true, keyword);
  });
}
if (attractionGrid && loader) {
  fetchAttractions(nextPage);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && nextPage) {
        fetchAttractions(nextPage);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
  });

  observer.observe(loader);
}

if (leftArrow && stationsContainer && rightArrow) {
  leftArrow.addEventListener('click', () => {
    stationsContainer.scrollBy({
      top: 0, 
      left: -1000,
      behavior: 'smooth'
    });
  });

  rightArrow.addEventListener('click', () => {
    stationsContainer.scrollBy({
      top: 0,
      left: 1000,
      behavior:'smooth'
    });
  });
}

}); //===============尾部

let nextPage = 0;
let isloading = false;

function fetchAttractions(page, isSearch = false, keyword = '') {
  const attractionGrid = document.querySelector('.attraction-grid');
  if (isloading) return;
    isloading = true;
    fetch(`http://13.236.156.145:8000/api/attractions?page=${page}&keyword=${keyword}`)
      .then(response => response.json())
      .then(data => {
        const attractions = data.data;
        nextPage = data.nextPage;

        if(isSearch){
          attractionGrid.innerHTML = "";
        }

        attractions.forEach(attraction => {
          const attractionElement = document.createElement('div');
          attractionElement.classList.add('attraction');

          const imageElement = document.createElement('img');
          imageElement.src = attraction.images[0];
          imageElement.alt = `Attraction ${attraction.id}`;

          const infoElement = document.createElement('div');
          infoElement.classList.add('info');

          const nameElement = document.createElement('span');
          nameElement.textContent = attraction.name;

          const bottomBarElement = document.createElement('div');
          bottomBarElement.classList.add('bottom-bar');

          const mrtElement = document.createElement('span');
          mrtElement.textContent = attraction.mrt;

          const categoryElement = document.createElement('span');
          categoryElement.textContent = attraction.category;

          bottomBarElement.appendChild(mrtElement);
          bottomBarElement.appendChild(categoryElement);

          infoElement.appendChild(nameElement);

          attractionElement.appendChild(imageElement);
          attractionElement.appendChild(infoElement);
          attractionElement.appendChild(bottomBarElement);
          
          attractionGrid.appendChild(attractionElement);

          attractionElement.addEventListener('click',() => {
            window.location.href = `/attraction/${attraction.id}`
          });

        });
      isloading = false;
      })

      .catch(error => {
        console.error('Error fetching attractions:', error);
        isloading = false;
      });
}

document.addEventListener('DOMContentLoaded', async() => {
  try {
    const url = window.location.pathname;
    const attractionIdMatch = url.match(/\/attraction\/(\d+)/);
    if (attractionIdMatch) {
      const attractionId = attractionIdMatch[1];    
      const response = await fetch(`http://13.236.156.145:8000/api/attraction/${attractionId}`)
      const data = await response.json();
      const attraction = data.data;
    

      const picturesContainer = document.querySelector('.pictures');
      const dotsContainer = document.querySelector('.dots');
    
    attraction.images.forEach((imageUrl, index) => {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.classList.add('pictures');
      picturesContainer.appendChild(img);

      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        showSlide(index);
      });
      dotsContainer.appendChild(dot);
    });
    

  const nameElement = document.querySelector('.attraction-name')
  nameElement.textContent = attraction.name;

  const categoryElement = document.querySelector('.category-at-mrt')
  categoryElement.textContent = `${attraction.category} at ${attraction.mrt}`;

  const descriptionElement = document.querySelector('.description')
  descriptionElement.textContent = attraction.description;

  const addressElement = document.querySelector('.address')
  addressElement.textContent = attraction.address;

  const transportElement = document.querySelector('.transport')
  transportElement.textContent = attraction.transport;
  }
  
  } catch(error) { 
    console.error('Error for fetching attraction details', error);
  }

  let currentIndex = 0;

  function showSlide (index) {
    const slides = document.querySelectorAll('.pictures img');
    const dots = document.querySelectorAll('.dot');

    if (slides.length === 0) return; // 確保有圖片存在

    if (index >= slides.length) {
      currentIndex = 0;
    } else if (index < 0) {
      currentIndex = slides.length - 1;
    } else {
      currentIndex = index;
    }

    const offset = currentIndex * slides[0].clientWidth;
    const picturesContainer = document.querySelector('.pictures');
    picturesContainer.scrollLeft = offset;

    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');
    
    slides[currentIndex].classList.add('active');

  }

  const leftBtn = document.querySelector('.left-btn')
  const rightBtn = document.querySelector('.right-btn')
  if (leftBtn) {
    leftBtn.addEventListener('click', () => {
      showSlide(currentIndex - 1);
  });
  }
  if (rightBtn) {
    rightBtn.addEventListener('click', () => {
      showSlide(currentIndex + 1);
  });
  }
  window.addEventListener('resize', () => {
    showSlide(currentIndex);
  });
  showSlide(0);

});


