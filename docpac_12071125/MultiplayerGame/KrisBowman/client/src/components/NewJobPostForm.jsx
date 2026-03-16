function NewJobPostForm() {

    function saveJobPost(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const jobPost = {
            title: formData.get('jobTitle'),
            description: formData.get('jobDescription')
        };

        fetch('http://localhost:3001/api/job-posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(jobPost)
        })
        .then(response => {
            if (response.ok) {
                alert('Job posted successfully!');
                event.target.reset();
            } else {
                alert('Failed to post job.');
            }
        })
        .catch(error => {
            console.error('Error posting job:', error);
            alert('An error occurred while posting the job.');
        });
    }

    return (
        <>
        <h1>Post a New Job</h1>
        <form onSubmit={saveJobPost}>
            <div>
                <label htmlFor="jobTitle">Job Title:</label>
                <input type="text" id="jobTitle" name="jobTitle" required />
                <br />
                <label htmlFor="jobDescription">Job Description:</label>
                <textarea id="jobDescription" name="jobDescription" required></textarea>
            </div>
            <button type="submit">Post Job</button>
        </form>
        </>
    );
};

export default NewJobPostForm;