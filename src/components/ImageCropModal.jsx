import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cropper from 'react-easy-crop'

const ImageCropModal = ({ isOpen, onClose, imageSrc, onCropComplete, aspect = 16/9 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedImage)
      onClose()
    } catch (error) {
      console.error('Crop error:', error)
      alert('Kırpma hatası: ' + error.message)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl mx-4 bg-gray-800 rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Resmi Kırp</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Crop Area */}
            <div className="relative h-[60vh] bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onCropComplete={onCropCompleteCallback}
                onZoomChange={setZoom}
                style={{
                  containerStyle: {
                    backgroundColor: '#000'
                  }
                }}
              />
            </div>

            {/* Controls */}
            <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
              {/* Zoom Slider */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  onClick={handleCropConfirm}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  Kırp ve Kaydet
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper function to create cropped image
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc
    image.crossOrigin = 'anonymous'
    
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas boş'))
          return
        }
        const croppedImageUrl = URL.createObjectURL(blob)
        resolve(croppedImageUrl)
      }, 'image/jpeg', 0.95)
    }

    image.onerror = () => {
      reject(new Error('Resim yüklenemedi'))
    }
  })
}

export default ImageCropModal
