# REMBG SERVER

Rembg Server is a Node.js server that allows you to process images and remove their backgrounds using the Rembg library.

## Getting Started

Follow these instructions to set up and run the Rembg Server on your local machine.

### Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository

2. Install the required npm packages:
```bash
cd rembg-server
npm install
```

### Usage
To start the Rembg Server, run the following command:
```bash
npm start
```

The server will start running on the specified port (default is 3005).
http://localhost:3005/

### Endpoints
The Rembg Server provides the following endpoint:

* `POST /process`: Send a POST request to this endpoint with a JSON body containing the imageUrl of the image you want to process. The server will download the image, process it using Rembg to remove the background, and save the processed image locally. The response will contain the URL of the processed image.

#### Example Usage
```bash
curl -X POST http://localhost:3005/process \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/image.jpg"}'
```

#### Response
The server will respond with a JSON object containing the URL of the processed image:
```json
{
  "imageUrl": "http://localhost:3000/images/sku12345.png"
}
```

### Image Storage
The processed images are saved in the `processed_images` folder at the root of the project.

### CORS Configuration
The server is configured to allow cross-origin requests. By default, it allows requests from all origins. If you want to restrict access to specific origins, you can modify the CORS configuration in the index.js file.