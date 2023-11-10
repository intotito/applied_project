# Data Collection Methodology

## Background
### Limitations
Various difficulties are expected to be encountered during data collection which will limit the quantity of data that can be collected. This is as a result of the limited amount of devices available which can be handed out to volunteer to participate in the trials. Specifically the Activity Monitor which comes in the the form of a Smart Watch and Polar Smatch Watch in particular which have been adopted as the means of collecting users' biometric data, are limited in number. Also, to ensure the quality of data to be collected, a layed-out procedure have been developed as advised in the Smart Watch manufacturers' documentation to control biometric data collection. The data collection procedure is expected to be expensive in terms of time and effort.
As a result the aim is to get the minimum viable sample size of data possible for the analysis. 

The limitations mentioned above poses the following question for the research effort: 
-       How many samples are required to achieve an acceptable level of performance? 

### Previous Work
Previous studies by G. M. Foody et al already shows that bigger training dataset provides better classification performance over smaller training set. However,
according to the study of Ramezan CA et al, which explored the effects of the number of training samples on six different machine-learning algorithms to classify a large-area HR remotely sensed dataset. 
- Support Vector Machine (SVM)
- Random Forest (RF), k-nearest Neighbors (k-NN)
- Single-layer perceptron neural network(NEU)
- Learning Vector Quantization (LVQ)
- Gradient-Boosted Trees (GMB) 

The overall effect to reduced number sample size on the accuracy of the prediction was not significant. For context, a varying sample from 40 to 10,000 was tried out using the afore-mentioned algorithms. RF was found to have got the least hit from accuracy which degraded from $\approx$ 97% to $\approx$ 86% as sample size was reduced from 10000 to 40. Overall all the algorithm seem to perform relatively well at above 80% with a sample size of 40 except for the NEU which degraded to $\approx$ 76%. 

### Target

Considering the limitations and previous works mentioned in the previous sections, a sample size of 250 was considered a viable sample size for the project. Of the 250 sample size, 75% will be set out as training data while the remaining 25% will be used as testing data.

`As the research progresses other trialed techniques could be used to boost the dataset as may be required.` 

## Data Collection

### Biometric Data Collection

### Test Data Collection

The test data is generated at the completion of the test session in the Test Application. A test session consists of three categories of tests, which will be undertaken sequentially in different stages. For quality assurance, the test will be undertaken in a controlled environment using the same hardware in similar condition over the course of the trials.

For the purpose of the trial, a special designate room has been reserved for the 
 - **Audio Test**: designed to test users auditory precision. This test is expected to generate;
    -    `Average Response Time`: which is a measure of how quick a user is able to react and identify source of a sound with varying audibility (in decibels) in a 3-Dimensional space. 
 - **Visual Test**: designed to test users visual perception. At the end of this category of test, the following metrics were designed to measure users performance. 
    -    `Average Response Time`: measure of how quick a user can identify and engage targets.
    -    `Shot Accuracy`: measure of the percentage of successful shots to number of targets spawned.
    -    `Target Accuracy`: measure of the percentage of successful shots taken to number of targets hit. 
 - **Fine Motor Test**: designed to test users perception of depth and eye to hand coordination.
    -   `Average Tracking Time`: measure of average time it took for a player to successfully track, engage and elimate a target. 
    -   `Accuracy`: measure of the percentage of shots fired to the number of targets hit.



