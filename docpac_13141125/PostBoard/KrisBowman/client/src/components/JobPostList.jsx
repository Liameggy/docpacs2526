import React, { useEffect, useState } from 'react';
import NewCommentForm from './NewCommentForm';
import CommentList from './CommentList';

function JobPostList({ username }) {
    const [jobPosts, setJobPosts] = useState([]);
    const [visibleCommentForm, setVisibleCommentForm] = useState(null); // State to track visible comment form

    useEffect(() => {
        // Fetch data from the backend API
        fetch('http://localhost:3001/api/job-posts')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((jobPosts) => setJobPosts(jobPosts))
            .catch((error) => console.error('Error fetching job posts:', error));
    }, []);

    const toggleCommentForm = (jobId) => {
        // Toggle the visibility of the comment form for the given job ID
        setVisibleCommentForm((prev) => (prev === jobId ? null : jobId));
    };

    return (
        <div>
            <h1>Job Posts</h1>

            <ul>
                {jobPosts.map((job) => (
                    <>
                    <div key={job.id}>
                        <h2>{job.title}</h2>
                        <h3>Posted by: {job.poster}</h3>
                        <p>{job.content}</p>
                        <h6>{job.time}</h6>
                        {username && (
                            <button onClick={() => toggleCommentForm(job.id)}>Comment</button>
                        )}
                        {visibleCommentForm === job.id && (
                            <NewCommentForm postId={job.id} /> // Pass job.id to NewCommentForm
                        )}
                        <CommentList postId={job.id} />
                    </div>
                    </>
                ))}
            </ul>
        </div>
    );
}

export default JobPostList;