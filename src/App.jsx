// src/App.js
import React, { useState, useEffect } from 'react';

import { v4 as uuid } from 'uuid'
// import API from Amplify library
import { API, Auth, Storage } from 'aws-amplify'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
// import query definition
import { listPosts } from './graphql/queries'

function App() {
  const [posts, setPosts] = useState([])
  const [images, setImages] = useState([])
  async function fetchImages() {
    // Fetch list of images from S3
    let s3images = await Storage.list('')
    // Get presigned URL for S3 images to display images in app
    s3images = await Promise.all(s3images.map(async image => {
      const signedImage = await Storage.get(image.key)
      return signedImage
    }))
    setImages(s3images)
  }
  function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    // upload the image then fetch and rerender images
    Storage.put(uuid(), file).then (() => fetchImages())
  }
  async function checkUser() {
    const user = await Auth.currentAuthenticatedUser();
    console.log('user: ', user);
    console.log('user attributes: ', user.attributes);
  }
  useEffect(() => {
    fetchPosts();
    checkUser();
    fetchImages()
  }, []);

  
  async function fetchPosts() {
    try {
      const postData = await API.graphql({ query: listPosts });
      setPosts(postData.data.listPosts.items)
    } catch (err) {
      console.log({ err })
    }
  }
  return (
    <div>
      <div>
        <div></div>
        <div>
          <AmplifySignOut />
        </div>
      </div>
      <h1>All my items</h1>
      <table>
        <thead>
          <th>Name</th>
          <th>Brand</th>
          <th>Type</th>
        </thead>
        <tbody>
      {
        posts.map(post => (
          <tr key={post.id}>
            <td>{post.name}</td>
            <td>{post.location}</td>
            <td>{post.type}</td>
          </tr>
        ))}
        </tbody>
      </table>
    <div>
      <h1>Photo Album</h1>
      <span>Add new image</span>
      <input
        type="file"
        accept='image/png'
        onChange={onChange}
      />
      <div style={{display: 'flex', flexDirection: 'column'}}>
      { images.map(image => <img alt={image} src={image} style={{width: 400, marginBottom: 10}} />) }
      </div>
    </div>
    </div>
  )
}

export default withAuthenticator(App)
