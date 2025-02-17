class SfPortableSourceBrowsers {
    constructor(xmlUrl, containerId) {
        this.xmlUrl = xmlUrl;
        this.containerId = containerId;
        this.data = [];
        this.sortOrder = {}; // 정렬 상태 저장
        this.init();
    }

    // XML 데이터 로드 및 파싱
    async init() {
        try {
            const response = await fetch(this.xmlUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            this.parseXML(xml);
            this.renderTable();
        } catch (error) {
            console.error("XML 데이터를 불러오는 데 실패했습니다:", error);
        }
    }

    // XML을 JavaScript 배열로 변환
    parseXML(xml) {
        const browsers = xml.getElementsByTagName("browser");
        this.data = Array.from(browsers).map(browser => ({
            name: browser.getElementsByTagName("name")[0].textContent,
            engine: browser.getElementsByTagName("engine")[0].textContent,
            country: browser.getElementsByTagName("country")[0].textContent,
            download: browser.getElementsByTagName("download_link")[0].textContent,
            advantages: Array.from(browser.getElementsByTagName("advantage")).map(a => a.textContent),
            disadvantages: Array.from(browser.getElementsByTagName("disadvantage")).map(d => d.textContent)
        }));
    }

    // 테이블 렌더링
    renderTable() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <table id="browser-table">
                <thead>
                    <tr>
                        ${this.createHeaderCell("name", "브라우저명")}
                        ${this.createHeaderCell("engine", "엔진")}
                        ${this.createHeaderCell("country", "국가")}
                        ${this.createHeaderCell("download", "다운로드")}
                    </tr>
                </thead>
                <tbody>
                    ${this.data.map(this.createRow.bind(this)).join("")}
                </tbody>
            </table>
        `;
    }

    // 테이블 헤더 셀 생성 (정렬 기능 포함)
    createHeaderCell(key, label) {
        return `<th onclick="browserTable.sortTable('${key}')">${label} 🔽</th>`;
    }

    // 테이블 행 생성 (팝업 이벤트 포함)
    createRow(browser) {
        return `
            <tr onmouseover="browserTable.showPopup(event, '${browser.advantages.join(", ")}', '${browser.disadvantages.join(", ")}')" 
                onmouseout="browserTable.hidePopup()">
                <td>${browser.name}</td>
                <td>${browser.engine}</td>
                <td>${browser.country}</td>
                <td><a href="${browser.download}" target="_blank">다운로드</a></td>
            </tr>
        `;
    }

    // 테이블 정렬 기능
    sortTable(key) {
        const order = this.sortOrder[key] === "asc" ? "desc" : "asc";
        this.sortOrder[key] = order;
        this.data.sort((a, b) => {
            if (a[key] < b[key]) return order === "asc" ? -1 : 1;
            if (a[key] > b[key]) return order === "asc" ? 1 : -1;
            return 0;
        });
        this.renderTable();
    }

    // 팝업 표시
    showPopup(event, advantages, disadvantages) {
        let popup = document.getElementById("browser-popup");
        if (!popup) {
            popup = document.createElement("div");
            popup.id = "browser-popup";
            document.body.appendChild(popup);
        }
        popup.innerHTML = `<b>장점:</b> ${advantages}<br><b>단점:</b> ${disadvantages}`;
        popup.style.display = "block";
        popup.style.left = event.pageX + 10 + "px";
        popup.style.top = event.pageY + 10 + "px";
    }

    // 팝업 숨김
    hidePopup() {
        const popup = document.getElementById("browser-popup");
        if (popup) {
            popup.style.display = "none";
        }
    }
}

// 클래스 인스턴스 생성 및 실행
const browserTable = new SfPortableSourceBrowsers(
    "https://nuleongdung.github.io/data/portable-among-open-source-browsers-based-on-Chromium.xml",
    "sf-portable-source-browsers"
);