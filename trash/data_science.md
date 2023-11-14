# Data Science

## Database Design

Questions to be answered for the design of the database. 
- Where will the database reside?
- How does the database sync?
- When does the database sync?
- Is there an efficient way to sync the database without checking every possible values?

### Where will the database reside

Given the architecture of the system, there are two possible configurations for the relational database. Before delving into the possibilities,
it is important to highlight the constraints and limitations in the context of the project. 

#### Constraints & Limitations

    - The server end of the system architecture will be hosted on an Amazon EC2 Virtual machine running on Ubuntu 20.0.15 operating system. 
    - All charges and limited free usage policies of Amazon Cloud are applicable. 
    - The cost metrics is based on CPU usage and storage utilization. 
    - Cost is of paramount importance as the project has no budgetary allocation for any extra cost.

Now to the question posed earlier on, the following section describes the consideration and decision process that led to the chosen configuration. 
There are two viable options for hosting the database, these options are described below:
-   Hosting the database inside the Amazon EC2 Virtual machine. 
    This will involve installing the database server in the virtual machine where all the database operations requiring CPU usage will be done within the virtual machine. This will likely cause a peak in CPU usage as many operations are expected to be done in the database. Amazon pricing policy does not discriminate between CPU usage done for Database base operation and any other operation. This architecture also means that the database is permanently attached to a running web application acting as an intermediatory. 
-   Hosting the database as a separate module as an Amazon Relational Database Service. This is inline with Software Design Principles that 
    advocate for loose coupling between software components. This option comes with the benefit of a self managed
    database system that lets the user focus on business logic as opposed to administrative + business logic. Cost comparison between these two alternatives seems to favour the EC2 VM configuration in the medium to long term. However Amazon Relation Database Service is available in the free-tier category and thus offers limited free monthly usage of 750 hour and a SSD storage capacity of 20GB.

Performance for both configurations are expected to be on par. For the short-term, which is within the scope of this project, hosting the database as a sub module using Amazon Relational Database Service offers the most cost effective alternative and thus was considered the best option for the project. 

### How does the database sync?

The architecture of the overall system calls for the relational datable to be in sync with the Firestore database. Since the data is expected to be generated and pulled from the Desktop Application to the Firestore Database, it offers two options for syncing with the relational database which will be a new component in the overall system architecture. 
-   Firstly, the data could be pushed to the relational database from the Desktop Application. Since there is a central database with multiple users, it implies that the relational database will have a one-to-many relationship configuration. Multiple Desktop Application will be writing to the relational database. This scenario might be a reflection to why a relational database was not used in the first place and for the context of the project, a real-time update is not a requirement.
-   The second option calls for a lazy type of synchronization between the Firestore Database and the Relational Database as of when required. 
The administrator on the Executive Dashboard requests for synchronization while working on available data set.

The second pattern seems to be the most appropriate for this scenario and thus was chosen as the model for the database synchronization. 

### When does the database sync?

The rational for choosing the mode of synchronization seems to provide justification for this question. An administrator working in the Executive Dashboard requests new data from the Firestore database and gets latest update if available. Then all other data processing as obtainable in the Executive Dashboard will be done using regularized data from the Relational Database. 

### Is there an efficient way to sync the database without checking every possible values?

This question seeks to query the best possible way to sync data between these two databases using minimum CPU time and memory. One option is to fetch every data and check if they already exists. 
A more efficient approach would be to fetch according the latest date of data already in the database (i.e. fetch all such data from the source database whose date are later than the latest date on the sink database). A not very obvious problem with this approach is that the source database have a one-to-many relationship with its various data write sources. There is no guaranteed order to data from various sources will be written to the database therefore the latest date on the sink database could render newly arrived data from the source database stale.

Yet another approach would be to maintain a data structure that stores the latest date per user. This will obviously incur more processing overhead as the request will have to be done per user.

## Database Schema

The purpose of the relational database is to have all data in a tabular form to provide ease of querying data as needed for data analysis. Therefore the data must be represented in a form that allows efficient querying and manipulation, thus normalization is not going to be a priority for this project, instead all data will be represented with the least possible number of tables. 

### Data

A total of eleven (11) variables are to represented in the database, they are as follows:
   - Test Data
        - Fine Motor: Average Tracking Time
        - Fine Motor: Accuracy
        - Visual : Average Response Time
        - Visual: Shot Accuracy
        - Visual: Target Accuracy
        - Audio: Average Response Time
   - Biometric Data
        - Maximum Heart Rate
        - Average Heart Rate
        - Active Steps
        - Heart Rate Variation (HRV)
        - Sleep

These variables will represent columns in a single table in the database. On the other hand as previously pointed out in the previous section, another table will be maintained for synchronization purpose and will have a date representing the latest update from the source database. 