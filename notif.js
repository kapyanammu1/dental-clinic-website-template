socket.onerror = function(error) {
    console.error("WebSocket error:", error);
    console.error("Error details:", {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        error: error.error
    });
};
