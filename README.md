# WebIK - An inverse kinematics for WebVR with support for ThreeJs and A-Frame.

WIP of an inverse kinematics for WebVR. Port from FinalIK (Unity C#) > VRIK.
The code has been ported but still need to be fully debugged. It is still not working correcty.

![](static/screenshot.png)

## Want to make some changes to it?

Please do! Together we can bring full body avatars to the web!

### Original c# source

Original c# source files from VRIK can be found in the c_sharp_source folder.
Note that this is not the full FinalIK project, only the VR part. I do not own the right on the C# files, they are only here to help us porting the code to the web.

### Installation

First make sure you have Node installed.

On Mac OS X, it's recommended to use [Homebrew](http://brew.sh/) to install Node + [npm](https://www.npmjs.com):

    brew install node

To install the Node dependencies:

    npm install

### Local Development

To serve the site from a simple Node development server:

    npm start

Then launch the site from your favourite browser:

[__http://localhost:3333/__](http://localhost:3333/)

## License

Distributed under an [MIT License](LICENSE).
