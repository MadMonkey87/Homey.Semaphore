Concurrency is the ability to run different applications in parallel and handle resources appropriately. Homey for example allows you to run multiple flows at once but it does not ensure that a specific resource (i.e. a logic variable) is accessed only once at a time. This can be problematic and can cause so named racing conditions.
A semaphore is a well known principle to prevent such issues as they ensure a resource is accessed only once at a time. This app provides such an semaphore for your Homey and enables more powerful automations.

Example

Let's consider the following scenario: you have 3 flows that all get triggered by the same event (i.e. a button press). Furthermore there is an logic variable initialized with the value of 0. Let's assume that every flow will calculate the value of the variable as +=1. As result you would expect the variable to be 3 after all the flows have completed, but in reality you will find that it has always a different value!
The reason for that is that we have a racing condition here. The operation of getting the variable, increasing it and writing it back to the memory is not atomic. Therefore it can be that multiple flows operate on the same variable at the same time. For example you would have this:
1) flow 1 reads the variable into the memory (0)
2) flow 2 reads the variable into the memory (0)
3) flow 1 increase the value and writes the variable back to memory (1)
4) flow 2 increase the value and writes the variable back to memory (1)

To prevent this behaviour we need to ensure that only one flow at the time is reading the variable, increasing it and writing it back.

To do so we need a semaphore:
1) in the condition of the 3 flows add the 'Wait until the semaphore is unlocked' flow card
2) the actions of the flow are now protected
3) create a new flow that gets triggered when the critical operation has completed. For this case you can use the trigger 'a variable has changed' and as action you use 'Unlock the semaphore'.

Note: the reason for the new flow is that actions get executed in parallel, so you need to ensure that the unlocking really happens after the critical operation has completed.

Now the following will happen: 
1) the first flow that checks the condition will lock the semaphore
2) whenever one of the other flows comes to check the condition it will wait and not continue for the moment (usually we are talking about milliseconds here)
3) the first flow card will do it's calculation and once this is done it will unlock the semaphore
4) the next flow card that is waiting can now continue etc. until all work is done!