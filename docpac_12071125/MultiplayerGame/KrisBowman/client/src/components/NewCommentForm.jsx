import React from 'react';

function NewCommentForm({ postId }) {
    function saveComment(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const comment = {
            postId: postId,
            comment: formData.get('content'),
        };

        fetch('http://localhost:3001/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(comment)
        })
            .then(response => {
                if (response.ok) {
                    alert('Comment posted successfully!');
                    event.target.reset();
                } else {
                    alert('Failed to post comment.');
                }
            })
            .catch(error => {
                console.error('Error posting comment:', error);
                alert('An error occurred while posting the comment.');
            });
    }

    return (
        <>
            <form onSubmit={saveComment}>
                <div>
                    <label htmlFor="content">Write a Comment:</label>
                    <textarea id="content" name="content" required></textarea>
                </div>
                <button type="submit">Post Comment</button>
            </form>
        </>
    );
};

export default NewCommentForm;