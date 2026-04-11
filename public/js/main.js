// ===== CONFIRM DELETE =====
function confirmDelete() {
    return confirm("Bạn có chắc muốn xóa không?");
}


// ===== DARK MODE =====
function toggleTheme() {
    let theme = localStorage.getItem("theme");

    if (theme === "dark") {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    } else {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }

    updateIcon();
}

function updateIcon() {
    const btn = document.getElementById("themeBtn");
    const theme = localStorage.getItem("theme");

    if (btn) {
        btn.innerText = theme === "dark" ? "☀️" : "🌙";
    }
}

// load khi mở trang
window.onload = function () {
    let theme = localStorage.getItem("theme");

    if (theme === "dark") {
        document.body.classList.add("dark");
    }

    updateIcon();
}


// ===== PREVIEW AVATAR =====
function previewAvatar(event) {
    const img = document.getElementById("avatarPreview");
    if (!img) return;

    img.src = URL.createObjectURL(event.target.files[0]);
    img.style.display = "block";
}


// ===== CALENDAR POPUP (FIX CHUẨN) =====
// function openDay(dateStr) {

//     const popup = document.getElementById("popup");
//     const imagesDiv = document.getElementById("popup-images");
//     const totalDiv = document.getElementById("popup-total");
//     const title = document.getElementById("popup-date");

//     if (!popup) return;

//     imagesDiv.innerHTML = "";
//     totalDiv.innerHTML = "";

//     title.innerText = "📅 Ngày " + dateStr;

//     let total = 0;

//     // lọc theo ngày
//     const items = allData.filter(item => {
//         const d = new Date(item.date);

//         const localDate =
//             d.getFullYear() + '-' +
//             String(d.getMonth() + 1).padStart(2, '0') + '-' +
//             String(d.getDate()).padStart(2, '0');

//         return localDate === dateStr;
//     });

//     if (items.length === 0) {
//         imagesDiv.innerHTML = "<p>Không có dữ liệu</p>";
//     } else {

//         items.forEach(item => {

//             // tính tổng chi
//             if (item.type === "chi") {
//                 total += item.amount;
//             }

//             // ảnh
//             if (item.image) {
//                 imagesDiv.innerHTML += `
//                     <img src="${item.image}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;">
//                 `;
//             }

//             // text
//             imagesDiv.innerHTML += `
//                 <div class="border p-2 rounded mt-2">
//                     <b>${item.type === 'thu' ? 'Thu' : 'Chi'}</b> - 
//                     ${item.amount.toLocaleString()} đ
//                     <br>
//                     ${item.category || ''}
//                 </div>
//             `;
//         });
//     }

//     totalDiv.innerHTML = "💸 Tổng chi: " + total.toLocaleString() + " VNĐ";

//     popup.style.display = "flex";
// }


// ===== CLOSE POPUP =====
function closePopup() {
    const popup = document.getElementById("popup");
    if (popup) popup.style.display = "none";
}


// ===== CLICK NGOÀI ĐÓNG =====
window.addEventListener("click", function (e) {
    const popup = document.getElementById("popup");

    if (popup && e.target === popup) {
        popup.style.display = "none";
    }
});