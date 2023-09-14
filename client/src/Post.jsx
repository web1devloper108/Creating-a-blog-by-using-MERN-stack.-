import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { userContext } from './App'


function Post() {
  const { id } = useParams()
  const [post, setPost] = useState({})
  const navigate = useNavigate();
  const user = useContext(userContext)


  useEffect(() => {
    axios.get('http://localhost:4001/getpostbyid/' + id)
      .then(result => setPost(result.data))
      .catch(err => console.log(err))
  }, [])

  const handleDelete = (id) => {
    axios.delete('http://localhost:4001/deletepost/' + id)
      .then(result => {
        navigate('/')                                      ////move to home page
      })
      .catch(err => console.log(err))
  }
  return (

    <div className='post_container'>
      <div className='post_post'>
        <img src={`http://localhost:4001/Images/${post.file}`} alt="" className='post_post img' />

        <h2>{post.title}</h2>
        <p>{post.description}</p>
        <br />
        <div>
          {
            user.email === post.email ?
              <>
                <Link to={`/editpost/${post._id}`} className="primary-button">Edit</Link>


                <button onClick={e => handleDelete(post._id)} className="success-button">Delete</button>
                <br />
                <hr />
              </> : <></>

          }

        </div>
      </div>
    </div>


  )
}

export default Post
