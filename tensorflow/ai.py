
#import numpy as np
#print("TensorFlow version:", tf.__version__)
import matplotlib.pyplot as plt
import sys
import json
import numpy as np
from dotenv import load_dotenv
import tensorflow as tf
import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import r2_score

# import temporary directory
import tempfile

hash = sys.argv[1]

def main(hash):
    headers = {"Authorization": f"Bearer {os.getenv('API_SECRET_KEY')}"}
    df = pd.read_json(r'https://zerofourtwo.net/api/dataset', storage_options=headers)
    if(df is None or df.empty):
        return json.dumps({"error": "No data found"})
    
    # delete unwanted columns
    unwanted_columns = ['_id', '_date', '_user', 'bm_HR_max', 'bm_act_steps']
    df_wanted = df.drop(unwanted_columns, axis=1)

    # drop rows with missing values
    df_wanted = df_wanted.dropna()

    # plot normal distribution curve for each column using subplots
    fig, ax = plt.subplots(3, 3, figsize=(15, 15))
    for i, column in enumerate(df_wanted.columns):
        ax = plt.subplot(3, 3, i+1)
        df_wanted[column].plot(kind='kde', ax=ax)
        ax.set_title(column)
    plt.tight_layout()
    plt.savefig(tempfile.gettempdir() + "/" + hash + "/normal_distribution.png") 
    plt.close()

    # show correlation matrix
    correlation_matrix = df_wanted.corr()
    plt.figure(figsize=(12, 12))
    plt.matshow(correlation_matrix, fignum=1)
    plt.xticks(range(len(correlation_matrix.columns)), correlation_matrix.columns, rotation='vertical')
    plt.yticks(range(len(correlation_matrix.columns)), correlation_matrix.columns)
    plt.savefig(tempfile.gettempdir() + "/" + hash + "/correlation_matrix.png")

    df_independent = df_wanted.iloc[:, -3:]
    df_dependent = df_wanted.iloc[:, :-3]

    X = df_independent
    y = df_dependent

    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    y = scaler.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=4217)

    # create Neural Network model with 3 input and 6 output
    model = tf.keras.models.Sequential()
    model.add(tf.keras.layers.Dense(3, input_dim=3, activation='tanh'))
    model.add(tf.keras.layers.Dense(10, activation='tanh'))
    model.add(tf.keras.layers.Dense(15, activation='tanh'))
    model.add(tf.keras.layers.Dense(6, activation='tanh'))

    # compile model
    model.compile(optimizer='adam', loss='mean_squared_error')


    # train model
    fitting = model.fit(X_train, y_train, epochs=1000, batch_size=10, verbose=0)

    # plot training and validation loss
    plt.plot(model.history.history['loss'])
    plt.title('Training Loss')
    plt.ylabel('loss')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='upper left')
    plt.savefig(tempfile.gettempdir() + "/" + hash + "/training_loss.png")
    plt.close()

    # predict
    y_pred = model.predict(X_test, verbose=0)
    #r2_score(y_test, y_pred)

    # plot actual vs predicted for each column
    fig, ax = plt.subplots(3, 2, figsize=(15, 15))
    for i, column in enumerate(df_dependent.columns):
        ax = plt.subplot(3, 2, i+1)
        ax.plot(y_test[:, i], label='actual')
        ax.plot(y_pred[:, i], label='predicted')
        ax.set_title(column)
        ax.legend()
    plt.tight_layout()
    plt.savefig(tempfile.gettempdir() + "/" + hash + "/actual_vs_predicted.png")
    plt.close()

    # evaluate prediction for all data
    y_pred_all = model.predict(X, verbose=0)
    #r2_score(y, y_pred_all)

    # plot actual vs predicted for each column
    fig, ax = plt.subplots(3, 2, figsize=(15, 15))
    for i, column in enumerate(df_dependent.columns):
        ax = plt.subplot(3, 2, i+1)
        ax.plot(y[:, i], label='actual')
        ax.plot(y_pred_all[:, i], label='predicted')
        ax.set_title(column)
        ax.legend()
    plt.savefig(tempfile.gettempdir() + "/" + hash + "/actual_vs_predicted_all.png")
    plt.close()


    result = {
        "normal_distribution": "/" + hash + "/normal_distribution.png",
        "correlation_matrix": "/" + hash + "/correlation_matrix.png",
        "training_loss": "/" + hash + "/training_loss.png",
        "actual_vs_predicted": "/" + hash + "/actual_vs_predicted.png", 
        "actual_vs_predicted_all": "/" + hash + "/actual_vs_predicted_all.png",
    }
    return json.dumps(result)

if __name__ == "__main__":
    print(main(hash))
    