"""
Artifact 2: Computer Vision Defect Detection (Evidence)
Course: Artificial Intelligence and Machine Learning
Author: Sohaib Mahmood

Description:
This script demonstrates the core architecture used for the defect detection pipeline. 
It utilizes transfer learning with a pre-trained ResNet50 model to classify images 
of manufactured components as either 'Defective' or 'Normal'.
"""

import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

def build_defect_detection_model(input_shape=(224, 224, 3), num_classes=2):
    # 1. Load the pre-trained ResNet50 base model (excluding the top classification layers)
    base_model = ResNet50(weights='imagenet', include_top=False, input_shape=input_shape)
    
    # Freeze the base model layers to retain pre-trained features
    for layer in base_model.layers:
        layer.trainable = False

    # 2. Add custom classification head tailored to the defect detection task
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.5)(x) # Dropout for regularization
    predictions = Dense(num_classes, activation='softmax')(x)

    # 3. Compile the model
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(
        optimizer=Adam(learning_rate=0.001), 
        loss='categorical_crossentropy', 
        metrics=['accuracy']
    )
    
    return model

if __name__ == "__main__":
    print("Initializing Defect Detection Model Architecture...")
    model = build_defect_detection_model()
    model.summary()
    print("Model ready for training on augmented image dataset.")
