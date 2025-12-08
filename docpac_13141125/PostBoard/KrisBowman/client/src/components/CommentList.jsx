import React, { useEffect, useState } from 'react';

function CommentList() {
    const [commentPosts, setComments] = useState([]);

    useEffect(() => {
        // Fetch data from the backend API
        fetch('http://localhost:3001/api/comments')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((comments) => setComments(comments))
            .catch((error) => console.error('Error fetching comment posts:', error));
    }, []);

    return (
        <div>
            <ul>
                {commentPosts.map((comment) => (
                    <>
                    <div key={comment.id}>
                        <h3>Posted by: {comment.commenter}</h3>
                        <p>{comment.content}</p>
                        <h6>{comment.time}</h6>
                    </div>
                    </>
                ))}
            </ul>
        </div>
    );
}

export default CommentList;