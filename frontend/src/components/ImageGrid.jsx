// ImageGrid.jsx
import React, { useState } from "react";

const ImageGrid = ({ images }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const imagesToShow = images.slice(0, 4); // First 4 images for the grid
  const extraCount = images.length - 4; // Remaining image count

  // Grid layout styles based on the number of images
  const gridStyles = [
    "grid-cols-1 grid-rows-1", // 1 image
    "grid-cols-2 grid-rows-1", // 2 images
    "grid-cols-2 grid-rows-2", // 3 images
    "grid-cols-2 grid-rows-2", // 4+ images
  ];

  // Open modal with the clicked image index
  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  // Navigate through images in the modal
  const showPrevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const showNextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <>
      {/* Image Grid */}
      <div
        className={`w-64 h-64 grid gap-1 ${gridStyles[Math.min(imagesToShow.length - 1, 3)]}`}
      >
        {imagesToShow.map((src, index) => (
          <div key={index} className="relative">
            <img
              src={src}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover rounded cursor-pointer"
              onClick={() => openModal(index)}
            />
            {index === 3 && extraCount > 0 && (
              <div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded cursor-pointer"
                onClick={() => openModal(3)}
              >
                <span className="text-white text-2xl font-semibold">
                  +{extraCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DaisyUI Modal with Navigation */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative bg-white max-w-2xl">
            {/* Close Button */}
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>

            {/* Image Display */}
            <img
              src={images[currentIndex]}
              alt={`Expanded view ${currentIndex + 1}`}
              className="w-full h-auto rounded"
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <button
                className="btn btn-outline btn-sm"
                onClick={showPrevImage}
              >
                ⬅️ Previous
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={showNextImage}
              >
                Next ➡️
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGrid;
