document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!localStorage.getItem('adminToken')) {
        window.location.href = 'admin-login.html';
        return;
    }

    const coursesTableBody = document.querySelector('#courses-table tbody');
    const queriesTableBody = document.querySelector('#queries-table tbody');
    const addCourseForm = document.getElementById('add-course-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        });
    }

    // Load initial data
    loadCourses();
    loadQueries();

    // Add Course Handler
    addCourseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('course-name').value;
        const description = document.getElementById('course-desc').value;
        const category = document.getElementById('course-cat').value;

        try {
            await apiPost('/courses', { name, description, category });
            
            // Clear form and reload table
            addCourseForm.reset();
            loadCourses();
        } catch (error) {
            alert('Failed to add course. Please check the console.');
        }
    });

    // Delete Course Handler (event delegation)
    coursesTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this course?')) {
                try {
                    await apiDelete(`/courses/${id}`);
                    loadCourses();
                } catch (error) {
                    alert('Failed to delete course.');
                }
            }
        }
    });

    // Fetch and display courses
    async function loadCourses() {
        try {
            const data = await apiGet('/courses');
            coursesTableBody.innerHTML = '';
            
            if (data.courses.length === 0) {
                coursesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No courses available.</td></tr>';
                return;
            }

            data.courses.forEach(course => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${course.id}</td>
                    <td><strong>${course.name}</strong></td>
                    <td><span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${course.category}</span></td>
                    <td>${course.description}</td>
                    <td>
                        <button class="btn btn-danger delete-btn" data-id="${course.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Delete</button>
                    </td>
                `;
                coursesTableBody.appendChild(tr);
            });
        } catch (error) {
            coursesTableBody.innerHTML = '<tr><td colspan="5" class="text-center" style="color: var(--danger-color);">Error loading courses.</td></tr>';
        }
    }

    // Fetch and display queries
    async function loadQueries() {
        try {
            const data = await apiGet('/admin/queries');
            queriesTableBody.innerHTML = '';
            
            if (data.queries.length === 0) {
                queriesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No queries logged yet.</td></tr>';
                return;
            }

            data.queries.forEach(query => {
                const date = new Date(query.timestamp).toLocaleString();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-size: 0.85rem; color: var(--text-secondary);">${date}</td>
                    <td><strong>${query.student}</strong></td>
                    <td>${query.question}</td>
                    <td style="color: var(--success-color);">${query.answer}</td>
                `;
                queriesTableBody.appendChild(tr);
            });
        } catch (error) {
            queriesTableBody.innerHTML = '<tr><td colspan="4" class="text-center" style="color: var(--danger-color);">Error loading queries.</td></tr>';
        }
    }
});
