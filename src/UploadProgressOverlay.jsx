const UploadProgressOverlay = ({ 
    currentFile, 
    totalFiles, 
    progress, 
    uploadSpeed, 
    timeLeft 
  }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="space-y-6">
            {/* File Progress */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Uploading file {currentFile} of {totalFiles}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {/* Show file name or other details */}
              </p>
            </div>
  
            {/* Progress Bar */}
            <div className="relative">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Progress Text */}
              <div className="absolute top-6 left-0 right-0 text-center">
                <span className="text-3xl font-bold text-gray-800">
                  {progress}%
                </span>
                <p className="text-gray-600 text-sm mt-1">
                  UPLOADED
                </p>
              </div>
            </div>
  
            {/* Upload Stats */}
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <span>Time left: </span>
                <span className="font-medium">{timeLeft} SECONDS</span>
              </div>
              <div>
                <span>Upload speed: </span>
                <span className="font-medium">{uploadSpeed} KB/S</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default UploadProgressOverlay;