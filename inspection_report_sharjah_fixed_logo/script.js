


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let selectedRole = "reviewer";


/* =====================================================
   ROLE BUTTONS
===================================================== */

const roles =
    document.querySelectorAll(".role");


roles.forEach(function(role) {

    role.addEventListener("click", function() {

        roles.forEach(function(item) {

            item.classList.remove("active");

        });


        this.classList.add("active");


        selectedRole =
            this.dataset.role;

    });

});



/* =====================================================
   LOGIN
===================================================== */

function login() {


    const name =
        document
            .getElementById("employeeName")
            .value
            .trim();


    if (!name) {

        alert(
            "من فضلك اكتب اسم الموظف"
        );

        return;

    }


    document
        .getElementById("loginPage")
        .classList.add("hidden");


    /*
       لو مسؤول المراجعة
       افتح لوحة المراجعة
    */

    if (selectedRole === "reviewer") {


        document
            .getElementById("reportPage")
            .classList.add("hidden");


        document
            .getElementById("reviewPage")
            .classList.remove("hidden");

    }


    /*
       لو موظف ميداني
       افتح نموذج التقرير
    */

    else {


        document
            .getElementById("reviewPage")
            .classList.add("hidden");


        document
            .getElementById("reportPage")
            .classList.remove("hidden");

    }


    window.scrollTo(
        0,
        0
    );

}



/* =====================================================
   LOGOUT
===================================================== */

function logout() {


    document
        .getElementById("reviewPage")
        .classList.add("hidden");


    document
        .getElementById("reportPage")
        .classList.add("hidden");


    document
        .getElementById("loginPage")
        .classList.remove("hidden");


    document
        .getElementById("employeeName")
        .value = "";

}



/* =====================================================
   CHIPS
===================================================== */

document
    .querySelectorAll(".chip")
    .forEach(function(button) {


        button.addEventListener(
            "click",
            function() {


                const parent =
                    this.parentElement;


                parent
                    .querySelectorAll(".chip")
                    .forEach(function(item) {

                        item.classList
                            .remove("selected");

                    });


                this.classList
                    .add("selected");

            }
        );

    });



/* =====================================================
   YES / NO
===================================================== */

document
    .querySelectorAll(".yes-no button")
    .forEach(function(button) {


        button.addEventListener(
            "click",
            function() {


                document
                    .querySelectorAll(
                        ".yes-no button"
                    )
                    .forEach(function(item) {

                        item.classList
                            .remove("selected");

                    });


                this.classList
                    .add("selected");

            }
        );

    });



/* =====================================================
   UPLOAD DRAWING
===================================================== */

const uploadBox =
    document.getElementById(
        "uploadBox"
    );


const fileInput =
    document.getElementById(
        "file"
    );


uploadBox.addEventListener(
    "click",
    function() {

        fileInput.click();

    }
);


fileInput.addEventListener(
    "change",
    function() {


        if (!this.files.length) {

            return;

        }


        const file =
            this.files[0];


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                latestReportImage = event.target.result;

                uploadBox.innerHTML = `

                    <img
                        src="${event.target.result}"
                        style="
                            max-width:90%;
                            max-height:85px;
                            object-fit:contain;
                        "
                    >

                    <div
                        style="
                            margin-top:4px;
                            font-size:9px;
                        "
                    >
                        ${file.name}
                    </div>

                `;


                /*
                   عرض نفس الصورة
                   في صفحة المسؤول
                */

                document
                    .getElementById(
                        "reviewDrawing"
                    )
                    .innerHTML = `

                        <img
                            src="${event.target.result}"
                        >

                    `;

            };


        reader.readAsDataURL(file);

    }
);



/* =====================================================
   SUBMIT REPORT
===================================================== */

let latestSubmittedReport = null;
let latestReportImage = "";

function collectReportData() {
    const root = document.getElementById("reportPage");
    const data = {
        id: "RPT-" + Date.now(),
        submittedAt: new Date().toLocaleString("ar-AE"),
        employee: document.getElementById("employeeName").value.trim(),
        location: document.getElementById("reportLocation")?.value.trim() || "",
        coordinates: document.getElementById("locationCoords")?.value || "",
        fields: [],
        choices: [],
        requests: [],
        image: latestReportImage,
        status: "قيد المراجعة"
    };

    root.querySelectorAll(".panel .field").forEach(field => {
        const label = field.querySelector("label");
        const control = field.querySelector("input:not([type=file]):not([type=hidden]), textarea, select");
        if (label && control && control.id !== "reportLocation") {
            const value = (control.value || "").trim();
            if (value) data.fields.push({ label: label.textContent.trim(), value });
        }
    });

    root.querySelectorAll(".panel .chips").forEach(group => {
        const selected = group.querySelector(".chip.selected");
        if (selected) data.choices.push(selected.textContent.trim());
    });
    root.querySelectorAll(".yes-no .selected").forEach(btn => data.choices.push(btn.textContent.trim()));
    root.querySelectorAll(".request-grid .check").forEach(label => {
        const input = label.querySelector("input");
        if (input && input.checked) data.requests.push(label.textContent.trim());
    });
    return data;
}

function submitReport() {
    const data = collectReportData();
    if (!data.fields.some(item => /رقم القطعة|اسم المالك/.test(item.label) && item.value)) {
        const proceed = confirm("لم يتم إدخال اسم المالك أو رقم القطعة. هل تريدين حفظ التقرير على أي حال؟");
        if (!proceed) return;
    }

    latestSubmittedReport = data;
    try {
        const saved = JSON.parse(localStorage.getItem("inspectionReports") || "[]");
        saved.unshift({ ...data, image: "" });
        localStorage.setItem("inspectionReports", JSON.stringify(saved.slice(0, 100)));
    } catch (error) {
        alert("تعذر حفظ بيانات التقرير على هذا الجهاز. جرّبي صورة أصغر أو احذفي بعض البيانات.");
        return;
    }

    const success = document.getElementById("success");
    success.classList.remove("hidden");
    document.getElementById("reportActions").classList.remove("hidden");
    renderSavedReports();
    success.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderSavedReports() {
    const container = document.getElementById("savedReportsList");
    if (!container) return;
    let reports = [];
    try { reports = JSON.parse(localStorage.getItem("inspectionReports") || "[]"); } catch (_) {}
    container.innerHTML = reports.map(report => {
        const parcel = report.fields?.find(x => /رقم القطعة/.test(x.label))?.value || "غير محدد";
        const owner = report.fields?.find(x => /اسم المالك/.test(x.label))?.value || "غير محدد";
        const location = report.location || "لم يحدد الموقع";
        return `<section class="report-card saved-report-card"><div class="report-header"><div><strong>${escapeHTML("قطعة " + parcel + " - " + owner)}</strong><small>${escapeHTML(report.submittedAt || "")} · ${escapeHTML(report.employee || "")}</small></div><span class="status">${escapeHTML(report.status || "قيد المراجعة")}</span></div><div class="saved-report-details"><div><b>الموقع:</b> ${escapeHTML(location)}</div><div><b>رقم التقرير:</b> ${escapeHTML(report.id || "")}</div></div></section>`;
    }).join("");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}

function buildReportHTML(report, includeImage = true) {
    const rows = (report.fields || []).map(item => `<tr><th>${escapeHTML(item.label)}</th><td>${escapeHTML(item.value)}</td></tr>`).join("");
    const choices = (report.choices || []).map(x => `<li>${escapeHTML(x)}</li>`).join("");
    const requests = (report.requests || []).map(x => `<li>${escapeHTML(x)}</li>`).join("");
    const image = includeImage && report.image ? `<h3>الرسم الكروكي / الصورة</h3><img class="report-image" src="${report.image}" alt="الصورة المرفقة">` : "";
    const logoMarkup = `<img class="brand-image" src="sharjah-logo.jpeg" alt="شعار حكومة الشارقة">`;
    const map = report.coordinates ? `https://www.google.com/maps?q=${encodeURIComponent(report.coordinates)}` : "";
    return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير التفتيش ${escapeHTML(report.id)}</title><style>body{font-family:Tahoma,Arial,sans-serif;color:#263a33;margin:28px}header{display:flex;align-items:center;gap:14px;border-bottom:3px solid #155b48;padding-bottom:14px} .mark{background:#155b48;color:white;border-radius:50%;width:48px;height:48px;display:grid;place-items:center;font-size:28px;overflow:hidden}.mark img{width:100%;height:100%;object-fit:contain;background:#fff}.brand-image{width:100%;height:100%;object-fit:contain}h1{font-size:20px;margin:0}small{color:#66756f}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #d6dfdb;padding:9px;text-align:right}th{background:#edf4f1;width:30%}h3{margin-top:20px}img.report-image{max-width:100%;max-height:420px;object-fit:contain;border:1px solid #ddd}li{margin:5px 0}.meta{margin-top:12px}</style></head><body><header><div class="mark">${logoMarkup}</div><div><h1>نظام تقارير التفتيش التفصيلي</h1><small>تقرير تفتيش ميداني</small></div></header><div class="meta"><b>رقم التقرير:</b> ${escapeHTML(report.id)} &nbsp; <b>تاريخ الإرسال:</b> ${escapeHTML(report.submittedAt)}<br><b>الموظف:</b> ${escapeHTML(report.employee || "")}<br><b>الموقع:</b> ${escapeHTML(report.location || "غير محدد")} ${map ? `— <a href="${map}">فتح الخريطة</a>` : ""}</div><table>${rows}</table>${choices ? `<h3>الاختيارات</h3><ul>${choices}</ul>` : ""}${requests ? `<h3>نوع الطلب</h3><ul>${requests}</ul>` : ""}${image}<p><b>الحالة:</b> ${escapeHTML(report.status || "قيد المراجعة")}</p><script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script></body></html>`;
}

function downloadReportPDF() {
    if (!latestSubmittedReport) { alert("احفظي التقرير أولًا بالضغط على إرسال التقرير."); return; }
    const win = window.open("", "_blank");
    if (!win) { alert("اسمحي بفتح النوافذ المنبثقة ثم أعيدي المحاولة."); return; }
    win.document.open();
    win.document.write(buildReportHTML(latestSubmittedReport, true));
    win.document.close();
}


function useCurrentLocation() {
    if (!navigator.geolocation) { alert("المتصفح لا يدعم تحديد الموقع."); return; }
    const button = document.querySelector(".location-field .small-action");
    if (button) { button.disabled = true; button.textContent = "جارٍ تحديد الموقع..."; }
    navigator.geolocation.getCurrentPosition(position => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        document.getElementById("locationCoords").value = coords;
        const input = document.getElementById("reportLocation");
        if (!input.value.trim()) input.value = `إحداثيات: ${coords}`;
        const link = document.getElementById("mapLink");
        link.href = `https://www.google.com/maps?q=${encodeURIComponent(coords)}`;
        link.classList.remove("hidden");
        if (button) { button.disabled = false; button.textContent = "تحديد موقعي الحالي"; }
    }, error => {
        alert("لم نتمكن من تحديد الموقع. اسمحي للمتصفح باستخدام الموقع أو اكتبي العنوان يدويًا.");
        if (button) { button.disabled = false; button.textContent = "تحديد موقعي الحالي"; }
    }, { enableHighAccuracy: true, timeout: 10000 });
}

/* =====================================================
   ACCEPT REPORT
===================================================== */

function acceptReport() {


    const status =
        document.getElementById(
            "statusOne"
        );


    status.innerHTML =
        "مقبول ✓";


    status.style.background =
        "#eaf6f0";


    status.style.borderColor =
        "#82b49f";


    status.style.color =
        "#39705d";


    alert(
        "تم قبول التقرير"
    );

}



/* =====================================================
   REJECT REPORT
===================================================== */

function rejectReport() {


    const status =
        document.getElementById(
            "statusOne"
        );


    status.innerHTML =
        "مرفوض ✕";


    status.style.background =
        "#f4e8e8";


    status.style.borderColor =
        "#d6a0a0";


    status.style.color =
        "#a05d5d";


    alert(
        "تم رفض التقرير"
    );

}



/* =====================================================
   UNDER REVIEW
===================================================== */

function reviewReport() {


    const status =
        document.getElementById(
            "statusOne"
        );


    status.innerHTML =
        "قيد المراجعة ⏱";


    status.style.background =
        "#faf7ed";


    status.style.borderColor =
        "#b89a45";


    status.style.color =
        "#987d32";


    alert(
        "تم وضع التقرير قيد المراجعة"
    );

}



/* =====================================================
   FILTER BUTTONS
===================================================== */

document
    .querySelectorAll(".filter")
    .forEach(function(button) {


        button.addEventListener(
            "click",
            function() {


                document
                    .querySelectorAll(".filter")
                    .forEach(function(item) {

                        item.classList
                            .remove("active");

                    });


                this.classList
                    .add("active");

            }
        );

    });





// Load reports saved in this browser when the page opens
document.addEventListener("DOMContentLoaded", () => { renderSavedReports(); });


