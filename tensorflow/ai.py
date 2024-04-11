#import tensorflow as tf
#import numpy as np
#print("TensorFlow version:", tf.__version__)
import matplotlib.pyplot as plt
import sys
import json
import numpy as np

# import temporary directory
import tempfile

hash = sys.argv[1]

def main(hash):
    #print('intotitoto ================ ', tempfile.gettempdir())
    # plot x2 function using plt
    x = np.arange(0, 5, 0.1)
    y = x * 2
    plt.plot(x, y)
    plt.savefig(tempfile.gettempdir() + "/" + hash + "/plot.png")
    plt.close()

    # plot sigmoid function using plt
    x = np.arange(-5, 5, 0.1)
    y = 1 / (1 + np.exp(-x))
    plt.plot(x, y)
    plt.savefig(tempfile.gettempdir() + "/" + hash + "/sigmoid.png")
    plt.close()

    result = {
        "X**2":      "/" + hash + "/plot.png",
        "sigmoid":   "/" + hash + "/sigmoid.png"
    }
    return json.dumps(result)

if __name__ == "__main__":
    print(main(hash))
    