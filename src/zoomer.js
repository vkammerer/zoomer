/**
* Main class
*
* @class Zoomer
*/

const SuperPromise = () => {
	const superPromise = {};
	superPromise.promise = new Promise((resolve, reject) => {
		Object.assign(superPromise, { resolve, reject });
	});
	return superPromise;
};

class Zoomer {

	constructor(arg) {
		this.opts = arg;
		this.state = {
			ready: false,
			step: this.opts.step,
			stepsPerLevel: this.opts.stepsPerLevel,
		};
		this.handlers = { ready: [] };
		this._ = { animate: this.animate.bind(this) };
		async function init() {
			try {
				this.setElement();
			} catch (err) {
				console.log(`Zommer.js: No DOM element found with the selector: ${this.opts.selector}`);
				return;
			}
			try {
				await this.loadImages();
			} catch (err) {
				console.log('Zommer.js: error loading images: ', err);
				return;
			}
			this.setImagesPositions();
			this.setImagesScales();
			this.insertImages();
			this.state.ready = true;
			this.trigger('ready');
		}
		init.call(this);
	}

	setElement() {
		this.element = document.querySelector(this.opts.selector);
		if (!this.element) {
			throw new Error();
		}
	}

	loadImage(image) {
		const img = new Image();
		img.src = image.src;
		const imageSP = new SuperPromise();
		img.onload = imageSP.resolve.bind(this, Object.assign(image, { img }));
		img.onerror = imageSP.reject;
		return imageSP.promise;
	}

	loadImages() {
		const imagesSP = new SuperPromise();
		const imagesPromises = this.opts.images.map(this.loadImage);
		Promise.all(imagesPromises)
			.then(images => {
				this.images = images;
				imagesSP.resolve();
			})
			.catch(err => {
				imagesSP.reject(err);
			});
		return imagesSP.promise;
	}

	setImagesPositions() {
		const elementDimensions = this.element.getBoundingClientRect();
		const imgStyle = {
			position: 'absolute',
			willChange: 'transform',
			transition: `opacity ${this.opts.opacityTransitionDuration}ms linear`,
			left: `${(this.opts.width - elementDimensions.width) / -2}px`,
			top: `${(this.opts.height - elementDimensions.height) / -2}px`,
			width: `${this.opts.width}px`,
			height: `${this.opts.height}px`,
		};
		this.images.forEach(image => {
			Object.assign(image.img.style, imgStyle);
		});
	}

	setImageScale(image) {
		const scaleLevel = image.level - this.state.step / this.state.stepsPerLevel;
		const opacity = (scaleLevel > -2 && scaleLevel < 2) ? 1 : 0.001;
		const scale = 1 / Math.pow(2, scaleLevel);
		Object.assign(image.img.style, {
			opacity,
			transform: `scale3d(${scale}, ${scale},1)`,
		});
	}

	setImagesScales() {
		this.images.forEach(this.setImageScale, this);
	}

	insertImages() {
		const innerElement = document.createElement('div');
		Object.assign(innerElement.style, {
			position: 'relative',
			overflow: 'hidden',
			width: '100%',
			height: '100%',
		});
		this.images.forEach(image => {
			innerElement.appendChild(image.img);
		});
		this.element.innerHTML = '';
		this.element.appendChild(innerElement);
	}

	setZoom(arg) {
		Object.assign(this.state, {
			step: arg.step,
			stepsPerLevel: arg.stepsPerLevel || this.state.stepsPerLevel,
		});
		this.setImagesScales();
	}

	isAnimationFinished() {
		return (this.state.animationDirection === 'in' && this.state.step > this.state.toStep) ||
		(this.state.animationDirection === 'out' && this.state.step < this.state.toStep);
	}

	animate() {
		if (this.isAnimationFinished()) {
			this.state.animationPromiseResolve();
			return;
		}
		window.requestAnimationFrame(this._.animate);
		this.setImagesScales();
		this.state.step += this.state.animationDirection === 'in' ? 1 : -1;
	}

	animateZoom(arg) {
		const superPromise = new SuperPromise();
		Object.assign(this.state, {
			step: arg.fromStep,
			toStep: arg.toStep,
			stepsPerLevel: arg.stepsPerLevel || this.state.stepsPerLevel,
			animationPromiseResolve: superPromise.resolve,
			animationDirection: arg.fromStep < arg.toStep ? 'in' : 'out',
		});
		this._.animate();
		return superPromise.promise;
	}

	on(evName, func) {
		this.handlers[evName].push(func);
		if (this.state[evName]) this.trigger(evName);
	}

	trigger(evName) {
		this.handlers[evName].forEach(func => {
			func();
		});
		this.handlers[evName] = [];
	}

}

export default Zoomer;
