document.addEventListener('DOMContentLoaded', () => {
    // Modules & Login
    const loginSection = document.getElementById('login-section');
    const adminModule = document.getElementById('admin-module');
    const userModule = document.getElementById('user-module');

    const adminLoginBtn = document.getElementById('admin-login');
    const userLoginBtn = document.getElementById('user-login');
    const logoutAdminBtn = document.getElementById('logout-admin');
    const logoutUserBtn = document.getElementById('logout-user');

    // Admin Elements
    const studentForm = document.getElementById('student-form');
    const studentList = document.getElementById('student-list');
    const listForm = document.getElementById('list-form');
    const studentLists = document.getElementById('student-lists');
    const removeStudentBtn = document.getElementById('remove-student');
    const removeStudentListBtn = document.getElementById('remove-student-list');
    const downloadReportBtn = document.getElementById('download-report-admin');
    const downloadListSelect = document.getElementById('download-list');

    // User Elements
    const attendanceList = document.getElementById('attendance-list');
    const attendanceDate = document.getElementById('attendance-date');
    const userListSelect = document.getElementById('user-list');
    const saveAttendanceBtn = document.getElementById('save-attendance');
    const downloadReportUserBtn = document.getElementById('download-report-user');
    const userDownloadSelect = document.getElementById('user-download-list');

    // --- Login/Logout ---
    adminLoginBtn.addEventListener('click', () => {
        loginSection.classList.add('hidden');
        adminModule.classList.remove('hidden');
        userModule.classList.add('hidden');
        updateStudentLists();
    });

    userLoginBtn.addEventListener('click', () => {
        loginSection.classList.add('hidden');
        userModule.classList.remove('hidden');
        adminModule.classList.add('hidden');
        updateUserListDropdown();
    });

    logoutAdminBtn.addEventListener('click', () => {
        adminModule.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });
    logoutUserBtn.addEventListener('click', () => {
        userModule.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    // --- Admin Functions ---
    listForm.addEventListener('submit', e => {
        e.preventDefault();
        const listName = document.getElementById('list-name').value.trim();
        if (!listName) return alert("Enter list name!");
        const lists = JSON.parse(localStorage.getItem('studentLists')) || [];
        if (lists.includes(listName)) return alert("List already exists!");
        lists.push(listName);
        localStorage.setItem('studentLists', JSON.stringify(lists));
        localStorage.setItem(listName, JSON.stringify([]));
        updateStudentLists();
        listForm.reset();
    });

    studentForm.addEventListener('submit', e => {
        e.preventDefault();
        const selectedList = studentLists.value;
        if (!selectedList) return alert("Select a student list!");
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const className = document.getElementById('class').value.trim();
        const roll = document.getElementById('roll_number').value.trim();
        if (!name || !roll) return alert("Name & Roll required!");
        const students = JSON.parse(localStorage.getItem(selectedList)) || [];
        students.push({ name, email, class: className, roll_number: roll });
        localStorage.setItem(selectedList, JSON.stringify(students));
        updateStudentLists();
        studentForm.reset();
    });

    removeStudentBtn.addEventListener('click', () => {
        const selectedList = studentLists.value;
        if (!selectedList) return alert("Select a student list!");
        let students = JSON.parse(localStorage.getItem(selectedList)) || [];
        if (!students.length) return alert("No students to remove!");
        students.pop();
        localStorage.setItem(selectedList, JSON.stringify(students));
        updateStudentLists();
    });

    removeStudentListBtn.addEventListener('click', () => {
        const selectedList = studentLists.value;
        if (!selectedList) return alert("Select a student list!");
        localStorage.removeItem(selectedList);
        const lists = JSON.parse(localStorage.getItem('studentLists')) || [];
        const updated = lists.filter(l => l !== selectedList);
        localStorage.setItem('studentLists', JSON.stringify(updated));
        updateStudentLists();
    });

    downloadReportBtn.addEventListener('click', () => {
        const list = downloadListSelect.value;
        if (!list) return alert("Select a list!");
        const records = JSON.parse(localStorage.getItem('attendanceRecords')) || {};
        if (!records[list]) return alert("No records found for this list!");
        let csv = "Date,Name,Roll,Status\n";
        for (const [date, recs] of Object.entries(records[list])) {
            for (const [roll, status] of Object.entries(recs)) {
                const students = JSON.parse(localStorage.getItem(list)) || [];
                const student = students.find(s => s.roll_number === roll);
                if (student) csv += `${date},${student.name},${roll},${status}\n`;
            }
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${list}_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

    function updateStudentLists() {
        const lists = JSON.parse(localStorage.getItem('studentLists')) || [];
        studentLists.innerHTML = '<option value="">Select list</option>';
        downloadListSelect.innerHTML = '<option value="">Select list</option>';
        lists.forEach(l => {
            const opt1 = document.createElement('option'); opt1.value = l; opt1.textContent = l;
            const opt2 = document.createElement('option'); opt2.value = l; opt2.textContent = l;
            studentLists.appendChild(opt1);
            downloadListSelect.appendChild(opt2);
        });
        updateStudentListDisplay();
    }

    function updateStudentListDisplay() {
        const selectedList = studentLists.value;
        if (!selectedList) { studentList.innerHTML = ''; return; }
        const students = JSON.parse(localStorage.getItem(selectedList)) || [];
        studentList.innerHTML = '';
        students.forEach(s => {
            const li = document.createElement('li');
            li.textContent = `${s.name} (${s.roll_number})`;
            studentList.appendChild(li);
        });
    }

    // --- User Functions ---
    function updateUserListDropdown() {
        const lists = JSON.parse(localStorage.getItem('studentLists')) || [];
        userListSelect.innerHTML = '<option value="">Select list</option>';
        userDownloadSelect.innerHTML = '<option value="">Select list</option>';
        lists.forEach(l => {
            const opt1 = document.createElement('option'); opt1.value = l; opt1.textContent = l;
            const opt2 = document.createElement('option'); opt2.value = l; opt2.textContent = l;
            userListSelect.appendChild(opt1);
            userDownloadSelect.appendChild(opt2);
        });
        updateAttendanceDisplay();
    }

    userListSelect.addEventListener('change', updateAttendanceDisplay);

    function updateAttendanceDisplay() {
        const selectedList = userListSelect.value;
        if (!selectedList) { attendanceList.innerHTML = ''; return; }
        const students = JSON.parse(localStorage.getItem(selectedList)) || [];
        attendanceList.innerHTML = '';
        students.forEach(s => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${s.name} (${s.roll_number})</span>
                            <select data-roll="${s.roll_number}">
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                            </select>`;
            attendanceList.appendChild(li);
        });
    }

    saveAttendanceBtn.addEventListener('click', () => {
        const list = userListSelect.value;
        const date = attendanceDate.value;
        if (!list || !date) return alert("Select list & date!");
        const records = JSON.parse(localStorage.getItem('attendanceRecords')) || {};
        const attendance = {};
        document.querySelectorAll('#attendance-list select').forEach(sel => {
            attendance[sel.dataset.roll] = sel.value;
        });
        if (!records[list]) records[list] = {};
        records[list][date] = attendance;
        localStorage.setItem('attendanceRecords', JSON.stringify(records));
        alert("Attendance saved!");
    });

    // User download report
    downloadReportUserBtn.addEventListener('click', () => {
        const list = userDownloadSelect.value;
        if (!list) return alert("Select a list!");
        const records = JSON.parse(localStorage.getItem('attendanceRecords')) || {};
        if (!records[list]) return alert("No records found for this list!");
        let csv = "Date,Name,Roll,Status\n";
        for (const [date, recs] of Object.entries(records[list])) {
            for (const [roll, status] of Object.entries(recs)) {
                const students = JSON.parse(localStorage.getItem(list)) || [];
                const student = students.find(s => s.roll_number === roll);
                if (student) csv += `${date},${student.name},${roll},${status}\n`;
            }
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${list}_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

});
