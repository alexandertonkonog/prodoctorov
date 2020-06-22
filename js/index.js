let render = (link) => {
	if(window.location.href === window.location.origin+'/') {
		removeItem('.choosed');
		removeItem('.info');
		catalogRender();
	} else if(window.location.href === window.location.origin+'/choosed') {
		removeItem('.info');
		removeItem('.content');
		choosedRender();
	}
}
let removeItem = (name) => {
	let item = document.querySelector(name);
	if(item) item.remove();
}
//можно оптимизировать некоторые функции, сделать их более общими и передавать параметры
let catalogRender = async () => {
	let catalog = document.createElement('section');
	let main = document.querySelector('.main');
	catalog.className = 'content block';
	catalog.innerHTML = `<div class="preloader">
							<img src="images/loading.gif" alt="loading" class="preloader__img">
						</div>`;
	main.prepend(catalog);
	let data = await getData('https://json.medrating.org/users/'); 
	renderUsers(data);
	removeItem('.preloader');
}
let choosedRender = async () => {
	let main = document.querySelector('.main');
	let choosed = document.createElement('section');
	choosed.innerHTML = `<div class="preloader">
							<img src="images/loading.gif" alt="loading" class="preloader__img">
						</div>`;
	choosed.className = 'choosed block';
	main.prepend(choosed);
	let data = await getData('https://json.medrating.org/photos');
	renderChoosedImages(data);
	removeItem('.preloader');
}
let renderChoosedImages = (images) => {
	let i = 0;
	let choosed = document.querySelector('.choosed');
	let count = 0;
	images.forEach( image => {
		if(checkChoose(image.id)) {
			count++;
			let contentImgWrap = document.createElement('div');
			contentImgWrap.className = 'content__img-wrapper';
			contentImgWrap.innerHTML = `<p id="${image.id}" class="content__img-star ${checkStar(image.id)}">&#9733;</p>
			<img class="content__img-item" data-full-img="${image.url}" src="${image.thumbnailUrl}" alt="${image.title}" class="content__img">
			<p class="content__img-des">${image.title}</p>`;
			choosed.append(contentImgWrap);
			let picture = contentImgWrap.querySelector('.content__img-item');
			let star = contentImgWrap.querySelector('.content__img-star');
			clickChoose(star);
			imagesEvents(picture);
		}
	});
	if(!count) {
		renderInfo();
	}
}
let renderInfo = () => {
	let main = document.querySelector('.main');
	let info = document.createElement('p');
	info.className = 'info block';
	info.textContent = 'Нет избранных';
	main.prepend(info);
	removeItem('.choosed');
}
let renderUsers = (users) => {
	users.forEach(user => {
		let contentItem = document.createElement('div');
		let content = document.querySelector('.content');
		contentItem.innerHTML = `<div class="content__des">
									<img src="images/arrow.svg" alt="open" class="arrow content__arrow">
									<h2 class="content__name">${user.name || 'Ivan Ivanov'}</h2>
								</div>
								<div class="content__album-list dn" data-user="${user.id}"></div>`;
		contentItem.className = 'content__item';
		let contentDes = contentItem.querySelector('.content__des');
		let contentAlbumList = contentItem.querySelector('.content__album-list');
		clickHandler(contentDes, `https://json.medrating.org/albums?userId=${user.id}`, user.id, renderAlbums);
		toggleList(contentDes, contentAlbumList);
		content.append(contentItem);
	});
}
let renderAlbums = (albums, id) => {
	let lists = document.querySelectorAll(`.content__album-list[data-user="${id}"] .content__album`);
	let albumList = document.querySelector(`.content__album-list[data-user="${id}"]`);
	if(lists.length !== albums.length) {
		albums.forEach(album => {
			let contentAlbum = document.createElement('div');
			contentAlbum.className = 'content__album';
			contentAlbum.innerHTML = `<div class="content__album-des">
										<img src="images/arrow.svg" alt="open" class="arrow content__arrow">
										<h3 class="content__album-name">${album.title || 'Album '+album.id}</h3>
									</div>
									<div class="content__img-list dn" data-album="${album.id}"></div>`;

			let contentAlbumDes = contentAlbum.querySelector('.content__album-des');
			clickHandler(contentAlbumDes, `https://json.medrating.org/photos?albumId=${album.id}`, album.id, renderImages);
			let contentImgList = contentAlbum.querySelector('.content__img-list');
			toggleList(contentAlbumDes, contentImgList);
			albumList.append(contentAlbum);
		});
	}
}
let renderImages = (images, id) => {
	let lists = document.querySelectorAll(`.content__img-list[data-album="${id}"] .content__img-wrapper`);
	let imgList = document.querySelector(`.content__img-list[data-album="${id}"]`);
	if(lists.length !== images.length) {
		images.forEach(image => {
			let contentImgWrap = document.createElement('div');
			contentImgWrap.className = 'content__img-wrapper';
			contentImgWrap.innerHTML = `<p id="${image.id}" class="content__img-star ${checkStar(image.id)}">&#9733;</p>
			<img class="content__img-item" data-full-img="${image.url}" src="${image.thumbnailUrl}" alt="${image.title}" class="content__img">
			<p class="content__img-des">${image.title}</p>`;
			imgList.append(contentImgWrap);
			let picture = contentImgWrap.querySelector('.content__img-item');
			let star = contentImgWrap.querySelector('.content__img-star');
			starEvents(star);
			imagesEvents(picture);
		});
	}
}
let toggleList = (clickItem, changeItem) => {
	clickItem.addEventListener('click', () => {
		changeItem.classList.toggle('dn');
		changeItem.classList.toggle('pb10');
		let arrow = clickItem.querySelector('.arrow')
		arrow.classList.toggle('arrow_rotate90');
	})
}
let getData = async (link) => {
	let response = await fetch(link);
	let json = await response.json();
	return json;
}
let clickHandler = (item, link, id, fun) => {
	item.addEventListener('click', async (event) => {
		let data = await getData(link);
		fun(data, id);
	})
}
let imagesEvents = item => {
	item.addEventListener('click', event => {
		let modal = document.querySelector('.modal');
		let modalImg = modal.querySelector('img');
		modalImg.src = item.dataset.fullImg;
		modal.classList.remove('dn');
	})
}
let clickChoose = item => {
	starEvents(item);
	item.addEventListener('click', event => {
		item.parentNode.remove();
		let list = document.querySelectorAll('.content__img-wrapper');
		if(!list.length) {
			renderInfo();
		}
	})
}
let starEvents = item => {
	item.addEventListener('click', event => {
		if(window.localStorage.getItem(String(item.id))) {
			window.localStorage.removeItem(String(item.id))
			item.classList.remove('active');
		} else {
			window.localStorage.setItem(String(item.id), item.id)
			item.classList.add('active');
		}
	})
}
let checkStar = id => {
	let str = String(id);
	if (window.localStorage.getItem(str)) {
		return 'active'
	}
}
let checkChoose = id => {
	let str = String(id);
	if (window.localStorage.getItem(str)) {
		return true;
	}
	return false;
}


window.addEventListener('DOMContentLoaded', () => {
	let links = document.querySelectorAll('a');
	let exitModal = document.querySelector('.modal__exit');
	exitModal.addEventListener('click', event => {
		exitModal.parentNode.classList.add('dn');
	});
	links.forEach( link => {
		link.addEventListener('click', event => {
			event.preventDefault();
			if((window.location.origin + '/' +event.target.getAttribute('href')) !== window.location.href) {
				window.history.pushState( {} ,'title', window.location.origin + '/' + link.getAttribute('href'));
				render();
			}
		})
	});
	render();
})