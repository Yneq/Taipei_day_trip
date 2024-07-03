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
  const leftArrow = document.querySelector('.arrow-left');
  const rightArrow = document.querySelector('.arrow-right');
  const morningRadio = document.getElementById('morning');
  const afternoonRadio = document.getElementById('afternoon');
  const priceSpan = document.getElementById('price');
  const titleBtn = document.querySelector('.title');
  const datePicker = document.querySelector('.date-picker');
  const datePickerFrame = document.querySelector('.date-picker-frame');
  const overlay = document.querySelector('.overlay');
  const loginRegisterBtn = document.getElementById('login-register-btn');
  const loginemailInput = document.querySelector('.input-member[name="login-email"]');
  const loginpasswordInput = document.querySelector('.input-member[name="login-password"]');
  const failMessage = document.querySelector('.fail-email-password');
  const failEmailRegisted = document.querySelector('.fail-email-registed');
  const failRegisted = document.querySelector('.fail-registed');
  const successSignupMessage = document.querySelector('.success-signup');
  const successLoginMessage = document.querySelector('.success-login');
  const signupnameInput = document.querySelector('.input-member[name="signup-name"]');
  const signupemailInput = document.querySelector('.input-member[name="signup-email"]');
  const signuppasswordInput = document.querySelector('.input-member[name="signup-password"]');
  const signupRegisterBtn = document.getElementById('signup-register-btn');
  const bookingNameElement = document.querySelector('.booking-name');
  const bookingNmaeInputElement = document.querySelector('.input-name');
  const bookingEmailInputElement = document.querySelector('.input-mail');
  const bookingBtn = document.getElementById('bookingBtn');
  const startBookingBtn = document.querySelector('.start-booking-btn')
  const bookingPicture = document.querySelector('.booking-picture');
  const copyrightBar = document.querySelector('.copyright-bar');
  const bookingAttractionName = document.querySelector('.bookingAttractionName');
  const bookingDate = document.querySelector('.bookingDate'); 
  const bookingTime = document.querySelector('.bookingTime'); 
  const bookingPriceElement = document.querySelectorAll('.bookingPrice'); 
  const bookingLocation = document.querySelector('.bookingLocation');
  const greetingBooking = document.querySelector('.greeting-booking');
  const notBooking = document.querySelector('.not-booking');
  const greetingNoBooking = document.querySelector('.greeting-no-booking');
  const deleteBtn = document.querySelector('.delete-btn');


  let isLoggedIn = false;
  let userData = null;

  function checkLoginStatus(callback) {
    const token = localStorage.getItem('token');
    if (!token) {
      isLoggedIn = false;
      if (window.location.pathname === '/booking') {
        redirectToHomePage();
      }
      return;
    }
  
    fetch('http://13.236.156.145:8000/api/user/auth', {
      method: 'GET',
      headers: {'Authorization': `Bearer ${token}`}
    })
    .then(response => response.json())
    .then(data => {
      if (data.id) {
        isLoggedIn = true;
        loginBtn.textContent = '登出系統';
        userData = data;
        if (callback) callback();
      } else {
        throw new Error('User data not found');
      }
    })
    .catch(error => {
      console.error('unauthorized', error);
      localStorage.removeItem('token');
      isLoggedIn = false;
      loginBtn.textContent = '登入/註冊';
      if (window.location.pathname === '/booking') {
        redirectToHomePage();
      }
    });
  }
  
  

  function redirectToHomePage() {
    window.location.href = '/';
  }
  

  function fetchBookingData() {
    fetch('http://13.236.156.145:8000/api/booking', {
      method: 'GET',
      headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    })
    .then(response => response.json())
    .then(data => {
      if(data) {
        const attraction = data.attraction;
        attractionId = attraction.id      //attractionId 全局
        const image = attraction.image;
        bookingAttractionName.textContent = data.attraction.name;
        bookingDate.textContent = data.date;
        bookingTime.textContent = data.time;
        bookingLocation.textContent = data.attraction.address;
        const bookingPrice = data.price;
  
        bookingPriceElement.forEach(element => {
          element.textContent = bookingPrice;
        })
  
        if (image) bookingPicture.style.backgroundImage = `url(${image})`;
  
        greetingBooking.style.display = 'block';
        notBooking.style.display = 'block';
        greetingNoBooking.style.display = 'none';
        copyrightBar.style.height = '104px';
      } else {
        showNoBookingMessage();
      }
    })
    .catch(error => {
      console.log('Error Fetching booking data', error);
      showNoBookingMessage();
    });
  }
  

  function showNoBookingMessage() {
    greetingBooking.style.display = 'block';
    notBooking.style.display = 'none';
    greetingNoBooking.style.display = 'block';
    copyrightBar.style.height = '865px';
  }



  if (loginBtn) {
    loginBtn.onclick = function() {
      if (isLoggedIn) {
        isLoggedIn = false;
        localStorage.removeItem('token'); // 删除 token
        loginBtn.textContent = '登入/註冊';
        console.log('已登出');
        if (window.location.pathname === '/booking') {
          window.location.href = '/';
         } // 重定向到首頁
      } else {
        modal_login.style.display = "block";
        overlay.style.display = "block";
      }
    };
  }

  if (bookingBtn) {
    bookingBtn.onclick = function() {
      const token = localStorage.getItem('token')
      if (token) {
        window.location.href ='http://13.236.156.145:8000/booking'
      } else {
        modal_login.style.display = "block";
        overlay.style.display = "block";
      }
    }
  }

  if (startBookingBtn) {
    startBookingBtn.onclick = function() {
      const date = datePicker.value;
      const time = morningRadio.checked ? '上午9點到12點' : afternoonRadio.checked ? '下午2點到5點' : null;
      const price = priceSpan.textContent;
      const attractionId = window.location.pathname.split('/').pop();  // 在 URL 中包含 attractionId
      const token = localStorage.getItem('token');

      if (!date || !time) {
        alert('請選擇日期和時間');
        return;
      }
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      if (selectedDate < today) {
        alert('選擇的日期不能小於今日');
        return;
      }


      if (!token) {
        modal_login.style.display = 'block';
        overlay.style.display = 'block';
        return;
      }

      fetch('http://13.236.156.145:8000/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          attractionId: attractionId,
          date: date,
          time: time,
          price: parseInt(price, 10)
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Booking created successfully', data);
        window.location.href = '/booking';
      })
      .catch(error => {
        console.error('Error creating booking', error);
        alert('預定行程失敗');
      });
    };
  }



  closeBtn.forEach(btn => {
    btn.onclick = function () {
    modal_login.style.display = "none";
    modal_signup.style.display = "none";
    overlay.style.display = "none";
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

  if (loginRegisterBtn) {
    loginRegisterBtn.addEventListener('click', () => {
      if (loginemailInput && loginpasswordInput) {
        const email = loginemailInput.value;
        const password = loginpasswordInput.value;

        fetch('http://13.236.156.145:8000/api/user/auth', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email: email,
            password: password
          })
        })
        .then(response => {
          if (response.status === 400) {
            return response.json();
          } else if (!response.ok) {
            throw new Error('登入失敗，請檢查email,password');
          }
          return response.json();
        })
        .then(data => {
          if (data.error) {
            failMessage.style.display = 'block';
            setTimeout(() => {
              failMessage.style.display = 'none';
            }, 2000);
            console.log(data.message);
          } else if (data.token) {
            localStorage.setItem('token', data.token); // 保存 token 到 localStorage
            successLoginMessage.style.display = 'block';
            setTimeout(() => {
              successLoginMessage.style.display = 'none';
              modal_login.style.display = 'none'; 
              overlay.style.display = 'none'; 
            }, 2000);
            console.log('登入成功');
            isLoggedIn = true;
            loginBtn.textContent = '登出系統';
            if (window.location.pathname === '/booking') {
              fetchBookingData(); // 確保在 booking 頁面時重新加載預訂數據
            }
          } else {
            failMessage.style.display = 'block';
            setTimeout(() => {
              failMessage.style.display = 'none';
            }, 2000);
            console.log('電子郵件或密碼錯誤');
          }
        })
        .catch(error => {
          failMessage.style.display = 'block';
          setTimeout(() => {
            failMessage.style.display = 'none';
        }, 2000);
          console.log('Error', error);
        });
      } else {console.log('Email or password input not found');}
    });
  }
  
  if (signupRegisterBtn) {
    signupRegisterBtn.addEventListener('click', () => {
      if (!signupnameInput || !signupemailInput || !signuppasswordInput) {
        console.log('Email or password input not found');
        return;
    }

        const name = signupnameInput.value.trim();
        const email = signupemailInput.value.trim();
        const password = signuppasswordInput.value.trim();

        if (!name || !email || !password) {
            console.log('Some fields are empty');
            return;
        }

        console.log({name, email, password});  // for debug

    fetch('http://13.236.156.145:8000/api/user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })
    .then(response => {
        if (response.status === 422) {
          return response.json().then(data => {
            throw new Error(data.message || '註冊失敗，請檢查email,password');
        });
    } else if (!response.ok) {
        throw new Error('Email 已經註冊帳戶');
    }
    return response.json();
    })
    .then(data => {
        if (data.error) {
          failEmailRegisted.style.display = 'block';
            setTimeout(() => {
              failEmailRegisted.style.display = 'none';
            }, 2000);
            console.log(data.message);
        } else {
            console.log('註冊成功');
            successSignupMessage.style.display = 'block';
            setTimeout(() => {
                successSignupMessage.style.display = 'none';
            }, 2000);
        }
    })
    .catch(error => {
      if (error.message.includes('已經註冊')) {
        failEmailRegisted.style.display = 'block';
          setTimeout(() => {
            failEmailRegisted.style.display = 'none';
          }, 2000);
        } else {
          failRegisted.style.display = 'block';
          setTimeout(() => {
            failRegisted.style.display = 'none';
          }, 2000);
        }
        console.log('Error', error.message);
    });
});
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
  };

  if (datePickerFrame) {
    datePickerFrame.addEventListener('click', () => {
      datePicker.showPicker();
    });
  }

  if (datePicker) {
    datePicker.addEventListener('change', (event) => {
      const selectedDate = event.target.value;
    });
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
    const scrollAmount = stationsContainer.clientWidth * 0.9;
    stationsContainer.scrollBy({
      top: 0, 
      left: -scrollAmount,
      behavior: 'smooth'
    });
  });

  rightArrow.addEventListener('click', () => {
    const scrollAmount = stationsContainer.clientWidth * 0.9;
    stationsContainer.scrollBy({
      top: 0,
      left: scrollAmount,
      behavior:'smooth'
    });
  });
}

checkLoginStatus(() => {
  if (window.location.pathname === '/booking') {
    fetchBookingData();
  }
  if (bookingNameElement && bookingNmaeInputElement) {
    bookingNameElement.textContent = userData.name;
    bookingNmaeInputElement.value = userData.name;
    bookingEmailInputElement.value = userData.email;
  }
});

if (deleteBtn) {
  deleteBtn.addEventListener('click', ()=> {
    const token = localStorage.getItem('token'); 

  if (!token) {
    console.error('No token found');
    return;
  }
  fetch('http://13.236.156.145:8000/api/booking', {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('booking deleted successfully', data)
    location.reload();

  })
  .catch(error => {
    console.error('Error Deleting', error)
  });
  });
}

if (typeof TPDirect !== 'undefined') {

  const fields = {
  number: {
      // css selector
      element: '#card-number',
      placeholder: '**** **** **** ****'
  },
  expirationDate: {
      // DOM object
      element: document.getElementById('card-expiration-date'),
      placeholder: 'MM / YY'
  },
  ccv: {
      element: '#card-ccv',
      placeholder: 'ccv'
  }
};

TPDirect.card.setup({
    fields: fields,
    styles: {
        'input': {
            'border': '1px solid #ccc',
            'border-radius': '5px',
            'padding': '10px',
            'width': '100%',
            'max-width': '200px',
            'margin-bottom': '10px',
            'color': 'gray'
        },
        ':focus': {
            'color': 'black'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
});

TPDirect.card.onUpdate(function (update) {
  const payButton = document.getElementById('pay-button');
  if (update.canGetPrime) {
    payButton.removeAttribute('disabled');
  } else {
    payButton.setAttribute('disabled', true);
  }

  const updateFieldStatus = (field, status) => {
    if (status === 2) {
      field.classList.add('invalid');
    } else if (status === 0) {
      field.classList.remove('invalid');
      field.classList.add('valid');
    } else {
      field.classList.remove('invalid');
      field.classList.remove('valid');
    }
  };

  updateFieldStatus(document.getElementById('card-number'), update.status.number);
  updateFieldStatus(document.getElementById('card-expiration-date'), update.status.expiry);
  updateFieldStatus(document.getElementById('card-ccv'), update.status.ccv);

  
});


const paymentForm = document.getElementById('payment-form');

if (paymentForm) {
  paymentForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();

    // console.log('Tappay Fields Status:', tappayStatus);
    // console.log('Card Number Status:', tappayStatus.status.number);
    // console.log('Expiry Status:', tappayStatus.status.expiry);
    // console.log('CCV Status:', tappayStatus.status.ccv);

    if (!tappayStatus.canGetPrime) {
      alert('信用卡資訊填寫有誤');
      return;
    }

    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        alert('取得 Prime 失敗：' + result.msg);
        return;
      }

      const prime = result.card.prime;
      const price = parseInt(document.querySelector('.bookingPrice').textContent, 10);
      const attractionName = document.querySelector('.bookingAttractionName').textContent;
      const attractionAddress = document.querySelector('.bookingLocation').textContent;
      const attractionImage = document.querySelector('.booking-picture').style.backgroundImage.slice(5, -2);
      const tripDate = document.querySelector('.bookingDate').textContent;
      const tripTime = document.querySelector('.bookingTime').textContent;
      const contactName = document.querySelector('.input-name').value;
      const contactEmail = document.querySelector('.input-mail').value;
      const contactPhone = document.querySelector('.input-number').value;

      const requestBody = {
        prime: prime,
        order: {
          price: price,
          trip: {
            attraction: {
              id: attractionId,
              name: attractionName,
              address: attractionAddress,
              image: attractionImage
            },
            date: tripDate,
            time: tripTime
          },
          contact: {
            name: contactName,
            email: contactEmail,
            phone: contactPhone
          }
        }
      };

      console.log('Request Body:', requestBody);

      fetch('http://13.236.156.145:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(JSON.stringify(err));
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          alert('付款失敗：' + data.message);
        } else {
          const orderNumber = data.data.number;
          alert('付款成功');

          fetch('http://13.236.156.145:8000/api/booking', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          .then(response =>response.json())
          .then(() => {
            window.location.href = `/thankyou?order_number=${orderNumber}`;
          })
          .catch(error =>{
            console.log('Delete Error for bookings', error);
            window.location.href = `/thankyou?order_number=${orderNumber}`;
          });
        
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('付款失敗：' + error.message);
      });
    });
  });
}
} else {
  console.log('TPDirect 尚未初始化');
}

const urlParams = new URLSearchParams(window.location.search);
const orderNumber = urlParams.get('order_number');

if (!orderNumber) {
  console.error("沒有找到訂單號碼");
  return;
}

// 在支付成功後，使用獲取的訂單號碼調用 API
fetch(`http://13.236.156.145:8000/api/order/${orderNumber}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => response.json())
.then(data => {
  if (data) {
    const orderDetail = data;
    console.log("訂單詳情：", orderDetail);
    
    // 在前端顯示訂單詳情
    document.querySelector('.order-number').textContent = orderDetail.number;
    document.querySelector('.order-price').textContent = orderDetail.price;
    document.querySelector('.order-attraction-name').textContent = orderDetail.trip.attraction.name;
    document.querySelector('.order-attraction-address').textContent = orderDetail.trip.attraction.address;
    document.querySelector('.order-attraction-image').src = orderDetail.trip.attraction.image;
    document.querySelector('.order-date').textContent = orderDetail.trip.date;
    document.querySelector('.order-time').textContent = orderDetail.trip.time;
    document.querySelector('.order-contact-name').textContent = orderDetail.contact.name;
    document.querySelector('.order-contact-email').textContent = orderDetail.contact.email;
    document.querySelector('.order-contact-phone').textContent = orderDetail.contact.phone;
    document.querySelector('.order-status').textContent = orderDetail.status == 1 ? "PAID" : "UNPAID";
  } else {
    console.error("無法獲取訂單詳情");
  }
})
.catch(error => {
  console.error("Error fetching order details:", error);
});

  



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

