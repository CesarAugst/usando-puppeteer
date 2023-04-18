const { Cluster } = require('puppeteer-cluster');
const vanillaPuppeteer = require('puppeteer');
const { addExtra } = require('puppeteer-extra');

const util = require('util');
const zlib = require('zlib');
const gzip = util.promisify(zlib.gzip);

//permitou rastrear sites com cloud flare protection habilitado
const Stealth = require('puppeteer-extra-plugin-stealth');

const randomUseragent = require('random-useragent');

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
// nao funcionou com o cluster
//const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

// dica de:
//https://hackernoon.com/tips-and-tricks-for-web-scraping-with-puppeteer-ed391a63d952
const skippedResources = [
  'quantserve',
  'adzerk',
  'doubleclick',
  'adition',
  'exelator',
  'sharethrough',
  'cdn.api.twitter',
  'google-analytics',
  'googletagmanager',
  'google',
  'fontawesome',
  'facebook',
  'analytics',
  'optimizely',
  'clicktale',
  'mixpanel',
  'zedo',
  'clicksor',
  'tiqcdn',
];

const options = {
	//headless: true,
	userDataDir: __dirname + '/.cache-criado',
	args: [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-infobars',
		//'--single-process',
		'--no-zygote',
		'--no-first-run',
		//`--window-size=${options.width || 1280},${options.height || 800}`,
		'--window-size=1920x1080',
		'--window-position=0,0',
		'--ignore-certificate-errors',
		'--ignore-certificate-errors-skip-list',
		'--disable-dev-shm-usage',
		'--disable-accelerated-2d-canvas',
		'--disable-gpu',
		'--hide-scrollbars',
		'--disable-notifications',
		'--disable-background-timer-throttling',
		'--disable-backgrounding-occluded-windows',
		'--disable-breakpad',
		'--disable-component-extensions-with-background-pages',
		'--disable-extensions',
		'--disable-features=TranslateUI,BlinkGenPropertyTrees',
		'--disable-ipc-flooding-protection',
		'--disable-renderer-backgrounding',
		'--enable-features=NetworkService,NetworkServiceInProcess',
		'--force-color-profile=srgb',
		'--metrics-recording-only',
		'--mute-audio'
	]
};	

const run = async () => {
  const puppeteer = addExtra(vanillaPuppeteer);
  puppeteer.use(Stealth());
  //puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

  const cluster = await Cluster.launch({
    puppeteer,
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 4,
    puppeteerOptions: options
  });

  var jsonResponses = [];

  await cluster.task(async ({ page, data }) => {

	var jsonResponse = {
		id: 0,
		url: '',
		http_code: 0,
		content_type: '',
		size_download: 0,
		total_time: 0,
		erro_msg: '',
		html: ''
	}
	
	try {
		let url = data.url;
		let carregar_todos_recursos = (data.carregar_todos_recursos === 1);
		
		let id = parseInt(data.id);
		jsonResponse['id'] = id;

		let url_gzip = await gzip(url);
		jsonResponse['url'] = url_gzip.toString('base64');

		await page.setExtraHTTPHeaders({
			'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
			'Accept-Encoding': 'gzip, deflate',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
		});
		
		// randomizando view port pra evitar ser bloqueado
		await page.setViewport({
			width: 1920 + Math.floor(Math.random() * 100),
			height: 3000 + Math.floor(Math.random() * 100),
			deviceScaleFactor: 1,
			hasTouch: false,
			isLandscape: false,
			isMobile: false,
		});

		// randomizando user agent pra evitar ser bloqueado
		const UA = randomUseragent.getRandom(function (ua) {
			return (ua.deviceType == '') && parseFloat(ua.browserVersion) >= 20;
		});		
		await page.setUserAgent(UA);
		
		await page.setRequestInterception(true);
		page.on('request', (request) => {
		  if (request.resourceType() === 'document' 
			|| request.resourceType() === 'script' 
			|| request.resourceType() === 'xhr' 
			|| request.resourceType() === 'fetch'
			|| (carregar_todos_recursos && (request.resourceType() === 'other' || request.resourceType() === 'image' ||  request.resourceType() === 'stylesheet'))
		) {
			const requestUrl = request.url().split('?')[0].split('#')[0];		  
			if (skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)) {
				//console.log(requestUrl);
				request.abort();
			} else {		  
				request.continue();
			}
		  } else {
				//console.log(request.resourceType());
				request.abort();
		  }
		});

		//await page.goto(url);
		/*let httpResponse = await page.goto(url, {
			'timeout': 20000,
			'waitUntil': ['load', 'networkidle0']
		});
		*/
		
		let http_code = 0;
		let content_type = null;
		let headers = null;

		page.on('response', response => {
			if (response.url() === url || response.url() === url + '/') {
				http_code = response.status();
				headers = response.headers();
				content_type = headers['content-type']
			}
		});
		
		let httpResponse = await page.goto(url, {'waitUntil': 'networkidle0', 'timeout': 20000});
		await page.waitForSelector('body');
		
		// aguardando 3 segundos
		await new Promise(_func=> setTimeout(_func, 3000));

		let htmlContent = await page.content();
		//htmlContent = await gzip(htmlContent);
		//jsonResponse['html'] = htmlContent.toString('base64');
		jsonResponse['html'] = htmlContent;

		jsonResponse['crawler_processado'] = 1;
		//jsonResponse['http_code'] = parseInt(httpResponse['_status']);
		jsonResponse['http_code'] = parseInt(http_code);

		jsonResponse['size_download'] = 0;
		jsonResponse['total_time'] = 0;
		
		if (httpResponse['_statusText'] !== '' && httpResponse['_statusText'] !== 'OK'){
			let erro = await gzip(httpResponse['_statusText']);
			jsonResponse['erro_msg'] = erro.toString('base64');
		}

		//let url_final = await gzip(httpResponse['_url']);
		let url_final = await gzip(url); // o comando acima esta trazendo undefined, depois ver como resolver
		jsonResponse['url'] = url_final.toString('base64');
		
		//let contentType = await gzip(httpResponse['_headers']['content-type']);		
		content_type = await gzip(content_type);
		jsonResponse['content_type'] = content_type.toString('base64');
		
    } catch (err) {
		let erro = await gzip(err.toString());		
		jsonResponse['erro_msg'] = erro.toString('base64');
    } finally {
		jsonResponses.push(jsonResponse);
    }
	
  });

  for(let i=2; i<process.argv.length; ++i) {
	let params = process.argv[i].split(';');
	cluster.queue({id: params[0], carregar_todos_recursos: parseInt(params[1]), url: params[2]});
  }

  await cluster.idle();
  await cluster.close();
  
  console.log('OK');
  for(let i=0; i<jsonResponses.length; ++i)
	console.log(
		jsonResponses[i].id + ';'  //0
		+ jsonResponses[i].http_code + ';'  //1
		+ jsonResponses[i].size_download + ';' //2
		+ jsonResponses[i].total_time + ';' //3
		+ jsonResponses[i].content_type + ';' //4	
		+ jsonResponses[i].url + ';' //5
		+ jsonResponses[i].html + ';' //6
		+ jsonResponses[i].erro_msg //7
	);
  
};

run();
