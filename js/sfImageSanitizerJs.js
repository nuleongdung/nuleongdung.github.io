/**
 * @file sfImageSanitizerJs.js
 * @description 이미지 파일에서 XSS 공격 가능성을 검사하는 JavaScript 클래스입니다.
 *              로컬 파일 및 URL로부터 이미지를 분석하고, 악성 코드 패턴을 탐지합니다.
 */

class sfImageSanitizerJs {
    /**
     * @constructor
     * @description sfImageSanitizerJs 클래스의 생성자입니다.
     *              허용되는 MIME 타입, 최대 파일 크기, XSS 패턴 목록을 초기화합니다.
     */
    constructor() {
        /**
         * @property {Array<string>} allowedMimeTypes
         * @description 허용되는 MIME 타입 목록입니다.
         */
        this.allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        /**
         * @property {number} maxFileSize
         * @description 허용되는 최대 파일 크기(바이트 단위)입니다. 기본값은 10MB입니다.
         */
        this.maxFileSize = 10 * 1024 * 1024; // 10MB 제한 (조정 가능)

        /**
         * @property {Array<RegExp>} xssPatterns
         * @description XSS 공격 패턴을 탐지하기 위한 정규식 패턴 목록입니다.
         *              이 목록은 필요에 따라 추가하거나 수정할 수 있습니다.
         */
        this.xssPatterns = [ // 악성 코드 패턴 (추가/수정 가능)
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i, // <script> 태그
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i, // <iframe> 태그
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/i, // <object> 태그
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/i,   // <embed> 태그
            /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/i,   // <style> 태그
            /javascript:/i, // javascript: URL
            /data:text\/html/i, // data:text/html URL
            /on\w+\s*=/i,       // onXXX= 이벤트 핸들러
            /<img src="x" onerror=".*?"/i, // onerror 속성
            /<body onload=".*?"/i, // onload 속성
            /<svg onload=".*?"/i, // SVG onload 속성
            /expression\(.*?\)/i, // CSS expression
            /url\((.*?javascript:)/i, // CSS url()
            /vbscript:/i, // vbscript URL
            /livescript:/i, // livescript URL
            /<\/title><script.*?>/i, // title 태그 XSS
            /type=['"]?text\/javascript['"]?/i, // script type
            /javascript:/i, // javascript:
            /javascript:/i,  // javascript:
            /data:application\/octet-stream;base64,/i, // data URL (octet-stream)
            /data:application\/javascript;base64,/i, // data URL (javascript)
            /data:image\/svg\+xml;base64,/i,  // data URL (SVG)
            /data:image\/png;base64,/i, // data URL (PNG)
            /data:image\/gif;base64,/i,  // data URL (GIF)
            /srcdoc\s*=/i, // iframe srcdoc 속성
            /style\s*=/i,  // style 속성
            /url\(['"]?javascript:/i, // CSS url(javascript:)
            /url\(['"]?vbscript:/i, // CSS url(vbscript:)
            /background\s*:/i, // CSS background 속성
            /behavior\s*:/i, // CSS behavior 속성 (IE)
            /binding\s*:/i,  // CSS binding 속성 (Firefox)
            /filter\s*:/i,   // CSS filter 속성 (IE)
            /execCommand\(/i, // execCommand 함수
            /document\.write/i, // document.write 함수
            /document\.location/i, // document.location 속성
            /window\.location/i,   // window.location 속성
            /setTimeout\(/i,  // setTimeout 함수
            /setInterval\(/i, // setInterval 함수
            /fromCharCode\(/i, // fromCharCode 함수
            /unescape\(/i,     // unescape 함수
            /eval\(/i,         // eval 함수
            /new Function\(/i,   // Function 생성자
            /ActiveXObject\(/i, // ActiveXObject (IE)
            /appendChild\(/i,  // appendChild 메서드
            /insertBefore\(/i, // insertBefore 메서드
            /innerHTML\s*=/i,  // innerHTML 속성
            /outerHTML\s*=/i,  // outerHTML 속성
            /insertAdjacentHTML\(/i, // insertAdjacentHTML 메서드
            /replaceWith\(/i,  // replaceWith 메서드
            /formaction\s*=/i, // formaction 속성
            /cookie\s*=/i, // cookie 조작
            /localStorage\s*=/i, // localStorage 조작
            /sessionStorage\s*=/i, // sessionStorage 조작
            /setRequestHeader\(/i, // setRequestHeader 함수
            /openDatabase\(/i, // openDatabase 함수 (WebSQL)
            /indexedDB\.(open|deleteDatabase)/i, // IndexedDB
            /addEventListener\(/i, // addEventListener 함수
            /removeEventListener\(/i, // removeEventListener 함수
            /dispatchEvent\(/i, // dispatchEvent 함수
            /postMessage\(/i, // postMessage 함수
            /importScripts\(/i, // importScripts 함수 (Web Worker)
            /createObjectURL\(/i, // createObjectURL 함수
            /revokeObjectURL\(/i, // revokeObjectURL 함수
            /Blob\(/i, // Blob 생성자
            /FileReader\(/i, // FileReader 객체
            /URLSearchParams\(/i, // URLSearchParams 객체
            /atob\(/i, // atob 함수 (Base64 디코딩)
            /btoa\(/i, // btoa 함수 (Base64 인코딩)
            /crypto\.getRandomValues\(/i, // crypto.getRandomValues 함수
            /history\.(pushState|replaceState)/i, // history API
            /navigator\.userAgent/i, // navigator.userAgent 속성
            /navigator\.cookieEnabled/i, // navigator.cookieEnabled 속성
            /navigator\.plugins/i, // navigator.plugins 속성
            /screen\.width/i, // screen.width 속성
            /screen\.height/i, // screen.height 속성
            /document\.referrer/i, // document.referrer 속성
            /Date\.now\(/i, // Date.now 함수
            /Math\.random\(/i, // Math.random 함수
            /String\.fromCharCode\(/i, // String.fromCharCode 함수
            /String\.prototype\.replace\(/i, // String.replace 함수
            /String\.prototype\.match\(/i,   // String.match 함수
            /String\.prototype\.search\(/i,  // String.search 함수
            /String\.prototype\.split\(/i,   // String.split 함수
            /String\.prototype\.substring\(/i, // String.substring 함수
            /String\.prototype\.slice\(/i,   // String.slice 함수
            /Array\.prototype\.push\(/i,   // Array.push 함수
            /Array\.prototype\.pop\(/i,    // Array.pop 함수
            /Array\.prototype\.shift\(/i,  // Array.shift 함수
            /Array\.prototype\.unshift\(/i, // Array.unshift 함수
            /Array\.prototype\.splice\(/i,  // Array.splice 함수
            /JSON\.stringify\(/i, // JSON.stringify 함수
            /JSON\.parse\(/i,     // JSON.parse 함수
            /decodeURIComponent\(/i, // decodeURIComponent 함수
            /encodeURIComponent\(/i, // encodeURIComponent 함수
            /decodeURI\(/i,      // decodeURI 함수
            /encodeURI\(/i,      // encodeURI 함수
            /RegExp\(/i,         // RegExp 생성자
            /Function\(/i,      // Function 생성자 (이미 존재하지만 강조)
            /eval\(/i,         // eval 함수 (이미 존재하지만 강조)
            /document\.domain\s*=/i, // document.domain 속성 조작
            /document\.baseURI\s*=/i, // document.baseURI 속성 조작
            /location\.hash\s*=/i,    // location.hash 속성 조작
            /location\.search\s*=/i,  // location.search 속성 조작
            /history\.replaceState\(/i, // history.replaceState 함수
            /sessionStorage\.setItem\(/i, // sessionStorage.setItem 함수
            /localStorage\.setItem\(/i, // localStorage.setItem 함수
            /Element\.prototype\.setAttribute\(/i, // setAttribute 메서드
            /Element\.prototype\.removeAttribute\(/i, // removeAttribute 메서드
            /insertAdjacentElement\(/i, // insertAdjacentElement 메서드
            /createTreeWalker\(/i,     // createTreeWalker 메서드
            /createNodeIterator\(/i,    // createNodeIterator 메서드
            /importNode\(/i,           // importNode 메서드
            /adoptNode\(/i,           // adoptNode 메서드
            /createDocumentFragment\(/i, // createDocumentFragment 메서드
            /customElements\.define\(/i, // customElements.define 메서드
            /Proxy\(/i,              // Proxy 객체
            /Reflect\.(apply|construct|defineProperty)/i, // Reflect API
            /Symbol\(/i,            // Symbol 객체
            /WeakMap\(/i,             // WeakMap 객체
            /WeakSet\(/i,             // WeakSet 객체
            /Map\(/i,              // Map 객체
            /Set\(/i,              // Set 객체
            /decodeURIComponent\(/i, // decodeURIComponent 함수 (강조)
            /encodeURIComponent\(/i, // encodeURIComponent 함수 (강조)
            /Function\.prototype\.bind\(/i, // Function.bind 함수
            /Function\.prototype\.call\(/i, // Function.call 함수
            /Function\.prototype\.apply\(/i, // Function.apply 함수
            /WebAssembly\.instantiate/i, // WebAssembly
            /SharedArrayBuffer\(/i,  // SharedArrayBuffer
            /Atomics\.(wait|notify)/i,  // Atomics API
            /new Worker\(/i,       // new Worker()
            /performance\.mark\(/i,   // performance.mark 함수
            /performance\.measure\(/i, // performance.measure 함수
            /console\.(log|warn|error|debug|info)/i, // console API
            /XMLHttpRequest\.prototype\.setRequestHeader\(/i, // XMLHttpRequest setRequestHeader
            /fetch\((.*?credentials: 'include')/i, // Fetch API with credentials
            /fetch\((.*?mode: 'no-cors')/i, // Fetch API with no-cors mode
            /navigator\.sendBeacon\(/i, // navigator.sendBeacon 함수
            /OffscreenCanvas\(/i, // OffscreenCanvas API
            /CanvasRenderingContext2D\.(drawImage|fillText|strokeText)/i, // Canvas API
            /WebGLRenderingContext\.(shaderSource|compileShader)/i, // WebGL API
            /AudioContext\(/i,  // AudioContext API
            /MediaSource\(/i,   // MediaSource API
            /SourceBuffer\.(appendBuffer|remove)/i, // SourceBuffer API
            /TextEncoder\(/i,   // TextEncoder API
            /TextDecoder\(/i,   // TextDecoder API
            /DOMParser\(/i,   // DOMParser API
            /XMLSerializer\(/i, // XMLSerializer API
            /XPathEvaluator\(/i, // XPathEvaluator API
            /MutationObserver\(/i, // MutationObserver API
            /document\.createElement\(['"]script['"]\)/i, // 동적 스크립트 생성 (createElement)
            /document\.body\.appendChild\(/i, // body에 동적 스크립트 추가
            /new Image\(\)\.src\s*=/i, // 이미지 객체를 이용한 GET 요청
            /XMLHttpRequest\.prototype\.open\(/i, // XMLHttpRequest open 메서드
            /fetch\((.*?)mode: 'cors'/i, // Fetch API with cors mode
            /fetch\((.*?)credentials: 'omit'/i, // Fetch API with credentials 'omit'
            /XDomainRequest\(/i, // XDomainRequest (IE)
            /ActiveXObject\((['"]?)Microsoft\.XMLHTTP\1\)/i, // Microsoft.XMLHTTP (IE)
            /URL\.createObjectURL\((.*?)\)/i, // URL.createObjectURL 사용
            /ServiceWorker\(/i, // ServiceWorker API
            /CacheStorage\.(open|delete)/i, // Cache API
            /Headers\(/i, // Headers API
            /Response\(/i, // Response API
            /ReadableStream\(/i, // ReadableStream API
            /TransformStream\(/i, // TransformStream API
            /WritableStream\(/i, // WritableStream API
            /SubtleCrypto\.(encrypt|decrypt|sign|verify|generateKey|importKey|exportKey)/i, // WebCrypto API
            /BigInt\(/i, // BigInt
            /Symbol\.iterator/i, // Symbol.iterator
            /Reflect\.getOwnPropertyDescriptor/i, // Reflect.getOwnPropertyDescriptor
            /Object\.defineProperty\(/i, // Object.defineProperty
            /Object\.defineProperties\(/i, // Object.defineProperties
            /Object\.setPrototypeOf\(/i, // Object.setPrototypeOf
            /Object\.getPrototypeOf\(/i, // Object.getPrototypeOf
            /Object\.create\(/i, // Object.create
            /Array\.from\(/i, // Array.from
            /Array\.isArray\(/i, // Array.isArray
            /Promise\.all\(/i, // Promise.all
            /Promise\.race\(/i, // Promise.race
            /Promise\.resolve\(/i, // Promise.resolve
            /Promise\.reject\(/i, // Promise.reject
            /MutationObserver\.observe\(/i, // MutationObserver.observe
            /IntersectionObserver\(/i,  // IntersectionObserver
            /ResizeObserver\(/i,      // ResizeObserver
            /PerformanceObserver\(/i, // PerformanceObserver
            /Geolocation\.getCurrentPosition\(/i, // Geolocation API
            /Navigator\.prototype\.getUserMedia\(/i, // getUserMedia (deprecated)
            /navigator\.mediaDevices\.getUserMedia\(/i, // navigator.mediaDevices.getUserMedia
            /MediaRecorder\(/i,   // MediaRecorder API
            /RTCPeerConnection\(/i, // RTCPeerConnection API
            /CanvasRenderingContext2D\.getImageData\(/i, // Canvas getImageData
            /WebGLRenderingContext\.(createTexture|bindTexture|texImage2D)/i, // WebGL 텍스처 관련
            /AudioBufferSourceNode\.(start|stop)/i, // AudioBufferSourceNode
            /AudioBuffer\.getChannelData\(/i, // AudioBuffer getChannelData
            /AnalyserNode\.getByteFrequencyData\(/i, // AnalyserNode
            /history\.pushState\((.*?)javascript:/i, // history API with javascript:
            /history\.replaceState\((.*?)javascript:/i, // history API with javascript:
            /document\.write\((.*?)<script/i, // document.write with script
            /setTimeout\((.*?)javascript:/i, // setTimeout with javascript:
            /location\.(href|replace)\((.*?)\)/i, // location.href 또는 location.replace 함수 사용
            /window\.open\((.*?)\)/i, // window.open 함수 사용
            /eval\((.*?)\)\s*\.call/i, // eval().call() 사용 패턴
            /Function\((.*?)\)\s*\.call/i, // Function().call() 사용 패턴
            /setTimeout\((.*?),[^'"]*['"]?eval\(.*?\)/i, // setTimeout에 eval 사용
            /setInterval\((.*?),[^'"]*['"]?eval\(.*?\)/i, // setInterval에 eval 사용
            /javascript:.*?(%[0-9a-f]{2})/i, // URL 인코딩된 javascript:
            /vbscript:.*?(%[0-9a-f]{2})/i, // URL 인코딩된 vbscript:
            /livescript:.*?(%[0-9a-f]{2})/i, // URL 인코딩된 livescript:
            /data:.*?(%[0-9a-f]{2})/i, // URL 인코딩된 data:
            /['"].*?javascript:.*?['"]/i, // 문자열 내 javascript:
            /['"].*?vbscript:.*?['"]/i, // 문자열 내 vbscript:
            /['"].*?livescript:.*?['"]/i, // 문자열 내 livescript:
            /['"].*?data:.*?['"]/i, // 문자열 내 data:
            /s[cr][i(]pt/i, // 변형된 script 태그 (소문자)
            /i[fr][a@][mme]/i, // 변형된 iframe 태그 (소문자)
            /o[bj&]ect/i, // 변형된 object 태그 (소문자)
            /em[b=]ed/i, // 변형된 embed 태그 (소문자)
            /st[yi]le/i, // 변형된 style 태그 (소문자)
            /o\nw\w+\s*=/i, // 변형된 이벤트 핸들러 (소문자, 개행)
            /cookie\s*=/i, // cookie 설정 (소문자)
            /localStorage\s*=/i, // localStorage 설정 (소문자)
            /sessionStorage\s*=/i, // sessionStorage 설정 (소문자)
            /location\.href\s*=/i, // location.href 설정 (소문자)
            /location\.replace\s*=/i, // location.replace 설정 (소문자)
            /document\.URL\s*=/i, // document.URL 설정 (소문자)
            /document\.location\s*=/i, // document.location 설정 (소문자)
            /window\.location\s*=/i, // window.location 설정 (소문자)
            /eval\((.*?)\)/i, // eval 함수 사용
            /unescape\((.*?)\)/i, // unescape 함수 사용
            /String\.fromCharCode\((.*?)\)/i, // String.fromCharCode 함수 사용
            /document\.write\((.*?)\)/i, // document.write 함수 사용
            /unescape\((.*?)\)/i, // unescape 함수 사용
            /top\.location\s*=/i, // top.location 설정
            /parent\.location\s*=/i, // parent.location 설정
            /self\.location\s*=/i, // self.location 설정
            /content\.location\s*=/i, // content.location 설정
            /window\.opener\.location\s*=/i, // window.opener.location 설정
            /document\.domain\s*=/i, // document.domain 설정
            /String\.prototype\.replace\((.*?)\)/i, // replace 함수 사용
            /String\.prototype\.search\((.*?)\)/i, // search 함수 사용
            /String\.prototype\.match\((.*?)\)/i, // match 함수 사용
            /atob\((.*?)\)/i, // atob 함수 사용
            /btoa\((.*?)\)/i, // btoa 함수 사용
            /setTimeout\((.*?)\)/i, // setTimeout 함수 사용
            /setInterval\((.*?)\)/i, // setInterval 함수 사용
            /new Function\((.*?)\)/i, // Function 생성자 사용
            /importScripts\((.*?)\)/i, // importScripts 함수 사용
            /createObjectURL\((.*?)\)/i, // createObjectURL 함수 사용
            /ActiveXObject\((.*?)\)/i, // ActiveXObject 사용
            /document\.implementation\.createHTMLDocument\(/i, // createHTMLDocument 사용
            /DOMParser\.prototype\.parseFromString\(/i, // DOMParser.parseFromString 사용
            /XMLHttpRequest\.responseXML/i, // XMLHttpRequest responseXML
            /xsltProcessor\.importStylesheet\(/i, // XSLT transform
            /xsltProcessor\.transformToFragment\(/i, // XSLT transform
            /createCDATASection\(/i, // CDATASection 생성
            /createComment\(/i,      // 주석 생성
            /navigator\.taintEnabled\(/i, // (deprecated) taintEnabled
            /window\.name\s*=/i,      // window.name 설정
            /opener\.location\s*=/i,    // opener.location 설정 (단축)
            /top\.location\s*=/i,       // top.location 설정 (단축)
            /parent\.location\s*=/i,    // parent.location 설정 (단축)
            /self\.location\s*=/i,      // self.location 설정 (단축)
            /content\.location\s*=/i,   // content.location 설정 (단축)
            /['"]javascript:[^'"]*?\/\/.*?\(['"]/i, // javascript: 주석 포함
            /['"]vbscript:[^'"]*?\/\/.*?\(['"]/i, // vbscript: 주석 포함
            /['"]livescript:[^'"]*?\/\/.*?\(['"]/i, // livescript: 주석 포함
            /style=[\s"']*[^-a-zA-Z0-9]/i, // style 속성, 특수문자 시작
            /style=[\s"']*url\s*\(["']?data:/i, // style 속성, data URL
            /<meta content=[\s"']?0;url=/i, // meta refresh (짧은 형태)
            /http-equiv=[\s"']?refresh/i, // meta refresh
            /SVG \s*DATA\s*,\s*</i, // SVG data URL
            /src=[\s"']?data:image\/svg\+xml/i, // data URL SVG
            /Object\.defineProperty\((.*?)\,\s*['"]innerHTML['"]/i, // defineProperty innerHTML
            /Object\.defineProperty\((.*?)\,\s*['"]outerHTML['"]/i, // defineProperty outerHTML
            /document\.baseURIObj\s*=/i,  // document.baseURIObj 설정
            /document\.URLUnencoded\s*=/i, // document.URLUnencoded 설정
            /frames\[\d+\]\.location/i,    // frames 접근
            /frames\['[^']*'\]\.location/i,  // frames 접근 (문자열)
            /open\((.*?)['"]_blank['"]\)/i,    // window.open _blank
            /unescape\((.*?)%u/i, // unescape 유니코드
            /unescape\((.*?)%U/i, // unescape 확장 유니코드
            /window\.execScript\((.*?)\)/i, // window.execScript 사용 (IE)
            /ScriptEngine\(/i,  // ScriptEngine (JScript)
            /ScriptEngineMajorVersion\(/i, // ScriptEngineMajorVersion
            /ScriptEngineMinorVersion\(/i, // ScriptEngineMinorVersion
            /ScriptEngineBuildVersion\(/i, // ScriptEngineBuildVersion
            /AddEvent\s*\(/i,   // AddEvent 함수
            /AttachEvent\s*\(/i, // AttachEvent 함수
            /RemoveEvent\s*\(/i, // RemoveEvent 함수
            /SetTimeout\s*\(/i,  // SetTimeout 함수 (대소문자)
            /SetInterval\s*\(/i, // SetInterval 함수 (대소문자)
            /VBArray\s*\(/i,     // VBArray 객체
            /GetLocale\s*\(/i,   // GetLocale 함수
            /ActiveXComponent\s*\(/i, // ActiveXComponent 함수
            /MSXML2\.XMLHTTP\s*\(/i, // MSXML2.XMLHTTP 객체
            /DOM\.loadXML\s*\(/i, // DOM.loadXML 함수
            /DOM\.setProperty\s*\(/i, // DOM.setProperty 함수
            /DOM\.addEventListener\s*\(/i, // DOM.addEventListener 함수
            /XMLDOM\.load\s*\(/i, // XMLDOM.load 함수
            /XMLDOM\.setProperty\s*\(/i, // XMLDOM.setProperty 함수
            /XMLDOM\.addEventListener\s*\(/i, // XMLDOM.addEventListener 함수
            /location\s*\[(['"])(.*?)\1\]\s*=/i, // 대괄호 표기법 location
            /window\s*\[(['"])(.*?)\1\]\s*=/i,   // 대괄호 표기법 window
            /document\s*\[(['"])(.*?)\1\]\s*=/i, // 대괄호 표기법 document
            /v[iiew]{4,5}-xp[rers]{3}/i, // MSIE expression() filter
            /url\s*\(\s*['"]?data:\s*text\/javascript/i, // CSS data URL javascript
            /url\s*\(\s*['"]?data:\s*text\/vbscript/i, // CSS data URL vbscript
            /url\s*\(\s*['"]?data:\s*text\/livescript/i, // CSS data URL livescript
            /meta\s*http-equiv\s*=\s*['"]?refresh['"]?\s*content\s*=\s*[^>]*url/i, //meta refresh url
            /eval\(.+?\)\.from/i, // eval().from
            /eval\(.+?\)\.constructor/i, // eval().constructor
            /Function\(.+?\)\.from/i, // Function().from
            /Function\(.+?\)\.constructor/i, // Function().constructor
            /String\.fromCharCode\s*\(.+?\)\s*\.constructor/i, // String.fromCharCode constructor
            /fetch\s*\(\s*[^)]*?\)\s*\.then\(/i, //fetch then
            /fetch\s*\(\s*[^)]*?\)\s*\.catch\(/i, //fetch catch
            /XMLDocument\s*\(\s*[^)]*?\)\s*\.loadXML/i, //XMLDocument loadXML
            /DOMParser\s*\(\s*[^)]*?\)\s*\.parseFromString/i, //DOMParser parseFromString
            /DOM\.load\s*\(\s*[^)]*?\)/i, //DOM load
            /setAttributeNS\s*\(\s*[^)]*?\)/i, //setAttributeNS
            /createAttributeNS\s*\(\s*[^)]*?\)/i, //createAttributeNS
            /importNode\s*\(\s*[^)]*?\)/i, //importNode
            /adoptNode\s*\(\s*[^)]*?\)/i, //adoptNode
            /navigator\.plugins\s*\[\s*['"]?Shockwave Flash['"]?\s*\]/i, //플래시 객체 확인
            /navigator\.javaEnabled\s*\(\s*\)/i, //자바 활성화 확인
            /navigator\.geolocation\s*\.\s*getCurrentPosition/i, //getCurrentPosition 함수호출
            /postMessage\s*\(\s*[^)]*?\s*\,\s*['"]?\*/i, //postMessage 전체 도메인
            /setRequestHeader\s*\(\s*['"]Content-Type['"]\s*\,\s*['"]text\/xml/i, //setRequestHeader text/xml
            /setRequestHeader\s*\(\s*['"]Content-Type['"]\s*\,\s*['"]application\/xml/i, //setRequestHeader application/xml
            /setRequestHeader\s*\(\s*['"]Content-Type['"]\s*\,\s*['"]text\/plain/i, //setRequestHeader text/plain
            /document\.cookie\s*\.\s*replace/i, //cookie replace
            /document\.cookie\s*\.\s*match/i, //cookie match
            /document\.cookie\s*\.\s*search/i, //cookie search
            /document\.cookie\s*\.\s*split/i, //cookie split
            /window\.name\s*\.\s*replace/i, //window.name replace
            /window\.name\s*\.\s*match/i, //window.name match
            /window\.name\s*\.\s*search/i, //window.name search
            /window\.name\s*\.\s*split/i, //window.name split
            /unescape\s*\(\s*['"]?%[uU][\dA-Fa-f]{4}['"]?\s*\)/i, //유니코드 Escape
            /setImmediate\s*\(\s*['"]?\w+?['"]?\s*\,\s*['"]?\w+?['"]?\s*\)/i, //setImmediate
            /toStaticHTML\s*\(/i, //toStaticHTML
            /URL\.revokeObjectURL\s*\(/i, //URL.revokeObjectURL
            /window\.sidebar\.addPanel\s*\(/i, //사이드바 추가
            /ActiveXObject\s*\(\s*['"]?WScript\.Shell['"]?\s*\)/i, //WScript.Shell
            /navigator\.registerProtocolHandler\s*\(/i, //registerProtocolHandler
            /showModalDialog\s*\(/i, //showModalDialog
            /DataView\s*\(\s*[^)]*?\s*\)/i, //DataView 객체 생성
            /Blob\s*\(\s*[^)]*?\s*\,\s*\{\s*type\s*:\s*['"]?\w+\/\w+['"]?\s*\}\s*\)/i, //Blob 객체 생성 시 type 지정
            /HTMLVideoElement\s*\(\s*[^)]*?\s*\)/i, //HTMLVideoElement 생성 시
            /HTMLAudioElement\s*\(\s*[^)]*?\s*\)/i, //HTMLAudioElement 생성 시
            /new\s+WebSocket\s*\(\s*['"]?wss?:\/\//i, //WebSocket wss 연결 시도
            /Performance\.getEntries\s*\(\s*\)/i, //Performance API getEntries 함수호출
            /requestFileSystem\s*\(/i, // requestFileSystem 함수호출
            /webkitRequestFileSystem\s*\(/i, // webkitRequestFileSystem 함수호출
            /createContextualFragment\s*\(/i, // createContextualFragment 함수 호출
            /Object\.getOwnPropertyNames\((.*?)\)/i, // 객체의 속성 이름 가져오기
            /Object\.keys\((.*?)\)/i, // 객체의 키 가져오기
            /Reflect\.ownKeys\((.*?)\)/i, // 객체의 심볼 속성 포함 모든 속성 이름 가져오기
            /Proxy\.revocable\((.*?)\)/i, // Revocable Proxy 생성
            /WeakRef\((.*?)\)/i, // WeakRef 생성
            /FinalizationRegistry\((.*?)\)/i, // FinalizationRegistry 생성
            /Atomics\.load\((.*?)\)/i, // Atomics.load 사용
            /Atomics\.store\((.*?)\)/i, // Atomics.store 사용
            /Atomics\.exchange\((.*?)\)/i, // Atomics.exchange 사용
            /WebAssembly\.compileStreaming\((.*?)\)/i, // 스트리밍 방식으로 WebAssembly 컴파일
            /WebAssembly\.Module\((.*?)\)/i, // WebAssembly 모듈 생성
            /WebAssembly\.Instance\((.*?)\)/i, // WebAssembly 인스턴스 생성
            /CryptoKey\.(encrypt|decrypt|sign|verify|exportKey)/i, // WebCrypto Key 객체 사용
            /XSLTProcessor\.transformToDocument\((.*?)\)/i, // XSLT 변환 결과를 Document로
            /DOMImplementation\.createDocument\((.*?)\)/i, // XML Document 생성
            /Range\.prototype\.(selectNode|selectNodeContents|extractContents|cloneContents|insertNode|surroundContents|deleteContents)/i, // Range API 조작
            /DocumentFragment\.prototype\.(append|prepend|replaceChildren)/i, // DocumentFragment 조작
            /ShadowRoot\.prototype\.innerHTML\s*=/i, // Shadow DOM 조작
            /customElements\.define\((.*?),\s*class\s+extends\s+HTMLElement/i, // custom element 정의
            /customElements\.upgrade\((.*?)\)/i, // custom element 업그레이드
            /trustedTypes\.createPolicy\((.*?)\)/i, // Trusted Types Policy 생성
            /TrustedHTML\((.*?)\)/i, // TrustedHTML 객체 생성
            /TrustedScript\((.*?)\)/i, // TrustedScript 객체 생성
            /TrustedScriptURL\((.*?)\)/i, // TrustedScriptURL 객체 생성
            /reportError\((.*?)\)/i, // reportError 함수
            /dispatchEvent\((.*?)\)/i, //dispatchEvent 함수 호출
            /structuredClone\((.*?)\)/i, // structuredClone 함수
            /BroadcastChannel\((.*?)\)/i, // BroadcastChannel API
            /URLSearchParams\.prototype\.(append|delete|set|get|getAll|has|keys|values|entries)\(/i, // URLSearchParams 조작
            /history\.pushState\((.*?)\,(.*?)\,(.*?)javascript:/i, // pushState 악용
            /history\.replaceState\((.*?)\,(.*?)\,(.*?)javascript:/i, // replaceState 악용
            /import\((.*?)\)/i, // Dynamic Import
            /crypto\.subtle\.(encrypt|decrypt|sign|verify|generateKey|importKey|exportKey)/i, // WebCrypto API subtle
            /WebAssembly\.validate\((.*?)\)/i, // WebAssembly 검증
            /FileReader\.prototype\.readAsDataURL\((.*?)\)/i, // FileReader DataURL
            /navigator\.registerProtocolHandler\((.*?)javascript:/i, // registerProtocolHandler JS
            /Clipboard\.prototype\.(readText|writeText)\((.*?)\)/i, // Clipboard API
            /BeforeInstallPromptEvent\.(prompt|userChoice)/i, // PWA
            /PresentationRequest\((.*?)\)/i, // Presentation API
            /launchQueue\.setConsumer\((.*?)\)/i, // Launch Queue API
            /FileSystemDirectoryHandle\.(getFileHandle|getDirectoryHandle|removeEntry)/i, // File System Access API
            /FileSystemFileHandle\.getWriter\((.*?)\)/i, // File System Access API
            /showOpenFilePicker\((.*?)\)/i, // File System Access API
            /showSaveFilePicker\((.*?)\)/i, // File System Access API
            /showDirectoryPicker\((.*?)\)/i, // File System Access API
            /createImageBitmap\((.*?)\)/i, // ImageBitmap API
            /HTMLCanvasElement\.transferControlToOffscreen\((.*?)\)/i, // OffscreenCanvas transfer
            /OffscreenCanvasRenderingContext2D\.(drawImage|fillText|strokeText)/i, // OffscreenCanvas API draw
            /WebTransport\((.*?)\)/i, // WebTransport API
            /console\.group\((.*?)\)/i, // console 그룹화 시작
            /console\.groupEnd\((.*?)\)/i, // console 그룹화 종료
            /console\.time\((.*?)\)/i, // console 시간 측정 시작
            /console\.timeEnd\((.*?)\)/i, // console 시간 측정 종료
            /dispatchEvent\s*\(\s*new\s+CustomEvent\s*\(/i, // CustomEvent 발송
            /CustomEvent\s*\(\s*[^)]*?\s*,\s*\{[^}]*?bubbles:\s*true/i, // 버블링 CustomEvent
            /CustomEvent\s*\(\s*[^)]*?\s*,\s*\{[^}]*?cancelable:\s*true/i, // 취소 가능 CustomEvent
            /stopImmediatePropagation\(\)/i, // stopImmediatePropagation 호출
            /console\.trace\((.*?)\)/i, // console.trace 사용
            /console\.assert\((.*?)\)/i, // console.assert 사용
            /console\.count\((.*?)\)/i, // console.count 사용
            /console\.table\((.*?)\)/i, // console.table 사용
            /console\.dir\((.*?)\)/i, // console.dir 사용
            /DOMException\((.*?)\)/i, // DOMException 객체 생성
            /ErrorEvent\((.*?)\)/i, // ErrorEvent 객체 생성
            /PromiseRejectionEvent\((.*?)\)/i, // PromiseRejectionEvent 객체 생성
            /reportError\((.*?)\)/i, // reportError 함수 호출
            /queueMicrotask\((.*?)\)/i, // queueMicrotask 함수 호출
            /Atomics\.waitAsync\((.*?)\)/i, // Atomics.waitAsync 사용
            /performance\.clearMarks\((.*?)\)/i, // Performance clearMarks 함수
            /performance\.clearMeasures\((.*?)\)/i, // Performance clearMeasures 함수
            /performance\.getEntriesByType\((.*?)\)/i, // Performance getEntriesByType 함수
            /navigator\.cookieEnabled\s*=\s*false/i, // cookie 활성화 여부 설정
            /navigator\.doNotTrack\s*=\s*1/i, // Do Not Track 설정
            /navigator\.vendor\s*=\s*/i, // navigator vendor 설정
            /screen\.orientation\s*=\s*/i, // screen orientation 설정
            /history\.scrollRestoration\s*=\s*/i, // scrollRestoration 설정
            /localStorage\.clear\(\)/i, // localStorage 초기화
            /sessionStorage\.clear\(\)/i, // sessionStorage 초기화
            /indexedDB\.(deleteDatabase|cmp)\((.*?)\)/i, // indexedDB 데이터베이스 삭제/비교
            /CSSStyleSheet\.prototype\.insertRule\((.*?)\)/i, // CSS rule 삽입
            /CSSStyleSheet\.prototype\.deleteRule\((.*?)\)/i, // CSS rule 삭제
            /document\.head\.appendChild\((.*?)\)/i, // head에 동적 엘리먼트 추가
            /document\.body\.insertBefore\((.*?)\)/i, // body에 엘리먼트 삽입
            /document\.body\.replaceChild\((.*?)\)/i, // body 엘리먼트 교체
            /document\.body\.removeChild\((.*?)\)/i, // body 엘리먼트 삭제
            /document\.createElementNS\((.*?)\)/i, // createElementNS 사용
            /setAttributeNode\((.*?)\)/i, // setAttributeNode 사용
            /createNodeIterator\((.*?)\)/i, // createNodeIterator 사용
            /createTreeWalker\((.*?)\)/i, // createTreeWalker 사용
            /XSLTProcessor\.setParameter\((.*?)\)/i, // XSLT 파라미터 설정
            /WebAssembly\.Memory\((.*?)\)/i, // WebAssembly 메모리 생성
            /DataView\.prototype\.(setInt8|setUint8|setInt16|setUint16|setInt32|setUint32|setFloat32|setFloat64)\((.*?)\)/i, // DataView 메모리 쓰기
            /new\s+Function\((.*?)\)\s*\((.*?)\)/i, // Function 생성 후 즉시 실행
            /eval\s*\((.*?)\)\s*\((.*?)\)/i, // eval 후 즉시 실행
            /Worker\.prototype\.postMessage\((.*?)\)/i, // Worker postMessage
            /SharedArrayBuffer\.prototype\.slice\((.*?)\)/i, // SharedArrayBuffer slice
            /Atomics\.add\((.*?)\)/i, // Atomics add
            /Atomics\.sub\((.*?)\)/i, // Atomics sub
            /Atomics\.and\((.*?)\)/i, // Atomics and
            /Atomics\.or\((.*?)\)/i,  // Atomics or
            /Atomics\.xor\((.*?)\)/i, // Atomics xor
            /Reflect\.set\((.*?)\)/i, // Reflect set
            /SVGPathElement\.prototype\.(getTotalLength|getPointAtLength|getPathSegAtLength)\(/i, // SVG 경로 측정
            /SVGRectElement\.prototype\.(getX|getY|getWidth|getHeight)\(/i, // SVG 사각형 속성
            /SVGCircleElement\.prototype\.(getCx|getCy|getR)\(/i, // SVG 원 속성
            /SVGLineElement\.prototype\.(getX1|getY1|getX2|getY2)\(/i, // SVG 선 속성
            /SVGPolygonElement\.prototype\.points\(/i, // SVG 다각형 점
            /SVGPolylineElement\.prototype\.points\(/i, // SVG 폴리라인 점
            /SVGTextElement\.prototype\.(getX|getY|getComputedTextLength)\(/i, // SVG 텍스트 속성
            /createSVGAngle\(/i, // SVGAngle 생성
            /createSVGMatrix\(/i, // SVGMatrix 생성
            /createSVGTransform\(/i, // SVGTransform 생성
            /createSVGTransformFromMatrix\(/i, // SVGTransformFromMatrix 생성
            /SVGNumber\.prototype\.(value|newValueSpecifiedUnits)\(/i, // SVGNumber 속성
            /SVGLength\.prototype\.(value|valueInSpecifiedUnits|valueAsString)\(/i, // SVGLength 속성
            /SVGStringList\.prototype\.(appendItem|clear|getItem|initialize|insertItemBefore|removeItem|replaceItem)\(/i, // SVGStringList 조작
            /SVGAnimatedString\.prototype\.animVal\(/i, // SVGAnimatedString animVal 접근
            /SVGAnimatedString\.prototype\.baseVal\(/i, // SVGAnimatedString baseVal 접근
            /SVGSVGElement\.prototype\.createSVGMatrix\((.*?)\)/i, // SVGMatrix 생성
            /CSSStyleDeclaration\.prototype\.setProperty\((.*?)\)/i, // CSS 속성 설정
            /CSSStyleDeclaration\.prototype\.removeProperty\((.*?)\)/i, // CSS 속성 제거
            /CSSStyleDeclaration\.prototype\.getPropertyValue\((.*?)\)/i, // CSS 속성 값 가져오기
            /CSSStyleRule\.prototype\.style\((.*?)\)/i, // CSS 스타일 속성 접근
            /MediaStreamTrack\.prototype\.(applyConstraints|clone|getCapabilities|getConstraints|getSettings|stop)\(/i, // MediaStreamTrack 조작
            /MediaDevices\.prototype\.enumerateDevices\((.*?)\)/i, // MediaDevices 열거
            /MediaRecorder\.prototype\.(start|stop|pause|resume|requestData)\((.*?)\)/i, // MediaRecorder 조작
            /RTCPeerConnection\.prototype\.(createOffer|createAnswer|setLocalDescription|setRemoteDescription|addIceCandidate|getConfiguration|getStats|close)\((.*?)\)/i, // RTCPeerConnection 조작
            /RTCPeerConnection\.prototype\.addTrack\((.*?)\)/i, // RTCPeerConnection 트랙 추가
            /RTCPeerConnection\.prototype\.removeTrack\((.*?)\)/i, // RTCPeerConnection 트랙 제거
            /RTCPeerConnection\.prototype\.getTransceivers\((.*?)\)/i, // RTCPeerConnection 트랜시버
            /RTCRtpSender\.prototype\.(replaceTrack|getStats)\((.*?)\)/i, // RTCRtpSender 조작
            /RTCRtpReceiver\.prototype\.getStats\((.*?)\)/i, // RTCRtpReceiver 조작
            /URL\.createObjectURL\((.*?),\s*\{type:\s*['"]text\/javascript['"]\}\)/i, // JS Blob URL
            /URL\.createObjectURL\((.*?),\s*\{type:\s*['"]application\/javascript['"]\}\)/i, // JS Blob URL
            /URL\.createObjectURL\((.*?),\s*\{type:\s*['"]application\/x-javascript['"]\}\)/i, // JS Blob URL
            /URL\.createObjectURL\((.*?),\s*\{type:\s*['"]text\/ecmascript['"]\}\)/i, // JS Blob URL
            /Worker\((.*?)['"](data:)/i, // Worker data URL
            /SharedWorker\((.*?)['"](data:)/i, // SharedWorker data URL
            /new\s+EventSource\s*\(\s*['"]?data:text\/event-stream/i, //EventSource data
            /BroadcastChannel\s*\(\s*[^)]*?\)\s*\.\s*postMessage/i,  // BroadcastChannel postMessage
            /Navigator\.prototype\.sendBeacon\s*\(\s*[^)]*?\s*\,\s*[^)]*?\s*\)/i, // Navigator.sendBeacon 호출
            /Performance\.prototype\.now\s*\(\s*\)/i, // Performance.now
            /TextEncoder\.prototype\.encode\s*\(\s*\)/i, // TextEncoder encode
            /TextDecoder\.prototype\.decode\s*\(\s*\)/i, // TextDecoder decode
            /AudioContext\.prototype\.createBufferSource\s*\(\s*\)/i, // AudioBufferSourceNode 생성
            /AudioBuffer\.prototype\.getChannelData\s*\(\s*\)/i, // AudioBuffer 채널 데이터 가져오기
            /AnalyserNode\.prototype\.getByteFrequencyData\s*\(\s*\)/i, // 주파수 데이터 가져오기
            /OffscreenCanvasRenderingContext2D\.prototype\.getImageData\s*\(\s*\)/i, // OffscreenCanvas 이미지 데이터
            /DOMParser\.prototype\.parseFromString\s*\(\s*['"]<html/i, // HTML 파싱
            /DOMParser\.prototype\.parseFromString\s*\(\s*['"]<svg/i, // SVG 파싱
            /ActiveXObject\s*\(\s*['"]?Msxml2\.DOMDocument\.6\.0['"]?\s*\)/i, // MSXML2.DOMDocument.6.0 객체
            /WScript\.Shell\s*\.\s*Run\s*\(/i, // WScript.Shell Run 메서드
            /Image\s*\(\s*\)\s*\.\s*src\s*=\s*data:/i // Image data url

        ];
    }

    /**
     * @async
     * @method scan
     * @param {File|string} input - 검사할 파일 객체 또는 이미지 URL입니다.
     * @param {boolean} [isURL=false] - 입력 데이터가 URL인지 여부를 나타내는 boolean 값입니다.
     * @returns {Promise<boolean|string>} - 검사 결과를 나타내는 Promise 객체입니다.
     *                                      성공하면 true, 실패하면 오류 메시지를 반환합니다.
     * @throws {Error} - 파일 타입, 크기, 매직 넘버 검사 실패 시 또는 URL로부터 파일 획득 실패 시 발생합니다.
     * @description 이미지 파일 또는 URL을 받아 XSS 공격 가능성을 검사합니다.
     *              파일 타입, 크기, 매직 넘버를 확인하고, 파일 내용에서 XSS 공격 패턴을 탐지합니다.
     */
    async scan(input, isURL = false) {
        try {
            /** @type {File} */
            let file;

            // 입력 타입에 따라 File 객체 획득
            if (isURL) {
                file = await this.urlToFile(input); // URL을 File 객체로 변환
                if (!file) {
                    throw new Error("URL에서 파일을 가져오는데 실패했습니다.");
                }
            } else {
                file = input; // input은 File 객체
            }

            // 1. 파일 타입 확인
            if (!this.isAllowedMimeType(file.type)) {
                throw new Error(`허용되지 않는 파일 형식입니다: ${file.type}`);
            }

            // 2. 파일 크기 확인
            if (!this.isAllowedFileSize(file.size)) {
                throw new Error(`파일 크기가 제한을 초과합니다: ${file.size} bytes`);
            }

            // 3. 매직 넘버 확인
            const isValidMagicNumber = await this.checkMagicNumber(file);
            if (typeof isValidMagicNumber === 'string') {
                throw new Error(`파일 내용이 예상되는 형식이 아닙니다: ${isValidMagicNumber}`);
            }
            if (!isValidMagicNumber) {
                throw new Error("파일 내용이 예상되는 형식이 아닙니다.");
            }

            // 4. 파일 내용 스캔
            const fileContent = await this.readFileContent(file);
            const xssResult = this.containsXSS(fileContent);
            if (xssResult) {
                const escapedContent = this.escapeHTML(fileContent.substring(xssResult.index, xssResult.index + 100));
                throw new Error(`XSS 공격 패턴이 발견되었습니다: ${xssResult.pattern}, 위치: ${xssResult.index}, 주변 내용: ${escapedContent}...`);
            }

            return true; // 모든 검사 통과
        } catch (error) {
            console.error("XSS 스캔 실패:", error);
            return error.message; // 스캔 실패 이유 반환
        }
    }

    /**
     * @method isAllowedMimeType
     * @param {string} mimeType - 확인할 MIME 타입입니다.
     * @returns {boolean} - MIME 타입이 허용 목록에 있으면 true, 그렇지 않으면 false를 반환합니다.
     * @description 주어진 MIME 타입이 허용 목록에 있는지 확인합니다.
     */
    isAllowedMimeType(mimeType) {
        return this.allowedMimeTypes.includes(mimeType);
    }

    /**
     * @method isAllowedFileSize
     * @param {number} fileSize - 확인할 파일 크기(바이트 단위)입니다.
     * @returns {boolean} - 파일 크기가 제한 크기 이하이면 true, 그렇지 않으면 false를 반환합니다.
     * @description 주어진 파일 크기가 허용된 최대 파일 크기 이하인지 확인합니다.
     */
    isAllowedFileSize(fileSize) {
        return fileSize <= this.maxFileSize;
    }

    /**
     * @async
     * @method checkMagicNumber
     * @param {File} file - 검사할 파일 객체입니다.
     * @returns {Promise<boolean|string>} - 매직 넘버가 유효하면 true, 그렇지 않으면 오류 메시지를 반환하는 Promise 객체입니다.
     * @description 파일의 매직 넘버를 확인하여 파일 형식을 검증합니다.
     */
    async checkMagicNumber(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const arr = (new Uint8Array(event.target.result)).subarray(0, 8);
                let header = "";
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16).padStart(2, '0');
                }

                console.log("Magic Number:", header);

                if (header.startsWith("ffd8ffe0") || header.startsWith("ffd8ffe1")) {
                    resolve(true);
                } else if (header.startsWith("89504e47")) {
                    resolve(true);
                } else if (header.startsWith("52494646") && header.includes("57454250")) {
                    resolve(true);
                } else if (header.startsWith("47494638")) {
                    resolve(false); // 우선 false 처리
                } else {
                    resolve("알 수 없는 파일 형식");
                }
            };
            reader.onerror = function (event) {
                reject("파일 읽기 오류");
            };
            reader.readAsArrayBuffer(file.slice(0, 8));
        });
    }

    /**
     * @method readFileContent
     * @param {File} file - 읽을 파일 객체입니다.
     * @returns {Promise<string>} - 파일 내용을 담은 문자열을 반환하는 Promise 객체입니다.
     * @description 파일의 내용을 텍스트 문자열로 읽어옵니다.
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                resolve(event.target.result);
            };
            reader.onerror = function (event) {
                reject("파일 읽기 오류");
            };
            reader.readAsText(file);
        });
    }

    /**
     * @method containsXSS
     * @param {string} fileContent - 검사할 파일 내용입니다.
     * @returns {boolean|object} - XSS 패턴이 발견되면 해당 패턴과 위치 정보를 담은 객체를 반환하고,
     *                            그렇지 않으면 false를 반환합니다.
     * @description 파일 내용에서 XSS 공격 패턴을 탐지합니다.
     */
    containsXSS(fileContent) {
        for (const pattern of this.xssPatterns) {
            const match = pattern.exec(fileContent);
            if (match) {
                console.warn("XSS 패턴 발견:", pattern);
                return {
                    pattern: pattern.toString(),
                    index: match.index
                };
            }
        }
        return false;
    }

    /**
     * @method escapeHTML
     * @param {string} str - HTML 엔티티로 이스케이프할 문자열입니다.
     * @returns {string} - HTML 엔티티로 이스케이프된 문자열을 반환합니다.
     * @description HTML 엔티티를 이스케이프하여 XSS 공격을 방지합니다.
     */
    escapeHTML(str) {
        let entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        return String(str).replace(/[&<>"'/]/g, function (s) {
            return entityMap[s];
        });
    }

    /**
     * @async
     * @method urlToFile
     * @param {string} url - 변환할 이미지 URL입니다.
     * @returns {Promise<File|null>} - URL로부터 생성된 File 객체를 반환하는 Promise 객체입니다.
     * @description 주어진 URL로부터 File 객체를 생성합니다.
     */
    async urlToFile(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], "image.jpg", { type: blob.type });
            return file;
        } catch (error) {
            console.error("URL에서 파일을 가져오는 중 오류 발생:", error);
            return null;
        }
    }
}

/**
 * @example
 * // sfImageSanitizerJs 클래스 사용 예시
 * const sanitizer = new sfImageSanitizerJs();
 * 
 * // 파일 객체를 사용하여 XSS 검사
 * const fileInput = document.getElementById('fileInput');
 * const file = fileInput.files[0];
 * 
 * sanitizer.scan(file)
 *   .then(result => {
 *     if (result === true) {
 *       console.log('XSS 스캔 통과: 안전한 파일입니다.');
 *     } else {
 *       console.warn('XSS 스캔 실패:', result);
 *     }
 *   })
 *   .catch(error => {
 *     console.error('XSS 스캔 오류:', error);
 *   });
 * 
 * @example
 * // URL을 사용하여 XSS 검사
 * const imageUrl = 'http://example.com/image.jpg';
 * 
 * sanitizer.scan(imageUrl, true)
 *   .then(result => {
 *     if (result === true) {
 *       console.log('XSS 스캔 통과: 안전한 URL입니다.');
 *     } else {
 *       console.warn('XSS 스캔 실패:', result);
 *     }
 *   })
 *   .catch(error => {
 *     console.error('XSS 스캔 오류:', error);
 *   });
 */