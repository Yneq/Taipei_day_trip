const stationsContainer = document.querySelector('.stations')
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

  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-bar input');

  searchInput.addEventListener('keypress', (event) => {     // Enter鍵 觸發
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


let nextPage = 0;

function fetchAttractions(page, isSearch = false, keyword = '') {
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
          imageElement.alt = 'Attracction Image';

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


        });
      })

      .catch(error => {
        console.error('Error fetching attractions:', error);
      });
}  

  const leftArrow = document.querySelector('.arrow-left')
  const rightArrow = document.querySelector('.arrow-right')
  
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

const loader = document.querySelector('.loader');
const attractionGrid = document.querySelector('.attraction-grid');

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

// fetch('http://127.0.0.1:8000/api/attractions') ***整合到fucntion fetchAttractions***
//   .then(response => response.json())
//   .then(data => {
//     const attractions = data.data;
//     attractions.forEach(attraction => {
//       const attractionElement = document.createElement('div');
//       attractionElement.classList.add('attraction');

//       const imageElement = document.createElement('img');
//       imageElement.src = attraction.images[0];
//       imageElement.alt = 'Attracction Image';

//       const infoElement = document.createElement('div');
//       infoElement.classList.add('info');

//       const nameElement = document.createElement('span');
//       nameElement.textContent = attraction.name;

//       const bottomBarElement = document.createElement('div');
//       bottomBarElement.classList.add('bottom-bar');

//       const mrtElement = document.createElement('span');
//       mrtElement.textContent = attraction.mrt;

//       const categoryElement = document.createElement('span');
//       categoryElement.textContent = attraction.category;

//       bottomBarElement.appendChild(mrtElement);
//       bottomBarElement.appendChild(categoryElement);

//       infoElement.appendChild(nameElement);

//       attractionElement.appendChild(imageElement);
//       attractionElement.appendChild(infoElement);
//       attractionElement.appendChild(bottomBarElement);
      
//       attractionGrid.appendChild(attractionElement);


//     });
//   })
//   .catch(error => {
//     console.log('Error fetching attraction:', error);
//   });


