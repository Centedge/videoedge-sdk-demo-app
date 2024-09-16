# videoedge-sdk-demo-app
This is a demo application built using the videoedge video sdk. It has all the basic actions including join-room, leave-room, mute/unmute, camera on/off etc already implemented so that anyonw who wished to build a video application quickly can clone it to get the functional boiler plate code ready.


## Clone the Demo App

1. Clone the demo app repository from GitHub:

```bash
git clone https://github.com/Centedge/videoedge-sdk-demo-app.git
```

2. Navigate to the cloned directory

```bash
cd videoedge-sdk-demo-app
```

3. Set Up Environment Variables

- Modify the file named `.env.sample` to `.env` in the root directory of the project.

- Open your [Videoedge dashboard](https://test-app.videoedge.io/) and navigate to the "Org Settings" section.

- Generate your access key and secret access key.

- Modify the following lines to your .env file, replacing ACCESS_KEY and SECRET_ACCESS_KEY with your actual access key and secret access key:

```javascript
ACCESS_KEY = your_access_key;
SECRET_ACCESS_KEY = your_secret_access_key;
```

4. Save the `.env` file

5. Start the Demo App

- Install the dependencies:

```bash
npm install
```

- Start the development server

```bash
npm start
```

- Open your browser and navtigate to `https://localhost:3300/`

- Enter the roomId and peerName and click `joinRoom` button.

- You should be able to see the call running.

- To invite others to the room, share the URL with them. They can join by entering the same roomId post deployment.

## Summary

By cloning the demo app, you can quickly get started with Videoedge without the hassle of setting everything up from scratch. This allows you to focus on making modifications and building your application using the SDK features.
If you prefer to set up and integrate the SDK into your application from scratch, you can refer to the events and methods documentation and follow the next steps for detailed explanation.

