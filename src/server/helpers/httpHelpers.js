class HttpHelpers {
  respondWith200OkText = (response, data) => {
    response.setHeader("content-type", "text/plain");
    response.status(200).send(data);
  };
  respondWith200OkJson = (response, data) => {
    delete data["status"];
    response.status(200).json({
      ...data,
      success: true,
      message: data.message,
      error: false,
      data: data.data,
      stack: null,
    });
  };
  respondWith400BadRequest = (response, data) => {
    response.status(400).json({
      success: false,
      message: data.message,
      error: true,
      data: null,
      stack: data.stack,
    });
  };
  respondWith401Unauthorized = (response, data) => {
    response.status(401).json({
      success: false,
      message: data.message,
      error: true,
      data: null,
      stack: null,
    });
  };
  respondWith201Created = (response, data) => {
    response.status(201).json({
      success: false,
      message: data.message,
      error: true,
      data: null,
      stack: null,
    });
  };
  respondWith500InternalServerError = (response, data) => {
    response.status(500).json({
      success: false,
      message: data.message,
      error: true,
      data: null,
      stack: data.stack,
    });
  };
  respondWith204NoContent = (response, data) => {
    response.status(204).json({
      success: false,
      message: data.message,
      error: true,
      data: null,
      stack: data.stack,
    });
  };
}

module.exports = HttpHelpers;
