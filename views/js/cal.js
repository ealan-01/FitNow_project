let goal, weight, height;

document.addEventListener('DOMContentLoaded', function () {
    const calorieBurnPerMinute = {
        'cardio': 11,
        'weightlifting': 4,
        'yoga': 5,
        'pilates': 7
    };
   
        fetch('/getUserData')
.then(response => response.json())
.then(data => {
    weight = data.weight;
    height = data.height;
    goal = data.calories;
        
    let totalCaloriesBurned = 0; // Initialize totalCaloriesBurned

    // Initialize jsConfetti
    const jsConfetti = new JSConfetti();
       

    

    document.getElementById('calculateBtn').addEventListener('click', function () {
        const selectedExercise = document.getElementById('exercise').value;
        const enteredMinutes = Number(document.getElementById('minutes').value);
        const caloriesBurned = enteredMinutes * calorieBurnPerMinute[selectedExercise];

        totalCaloriesBurned += caloriesBurned;

        if (totalCaloriesBurned === 0) {
            displayFunnyMessage(); // Call a function to display a funny message
        } else {
            document.querySelector('.total').textContent = `Fantastic! You've burned ${totalCaloriesBurned} calories. Keep it up!`;
        }

        let caloriesRemaining = goal - totalCaloriesBurned;
        if (caloriesRemaining < 0) caloriesRemaining = 0;  // Ensure it doesn't go negative

        updateProgressBar((totalCaloriesBurned / goal) * 100, caloriesRemaining);
    });

    function updateProgressBar(percentage, remaining) {
        let totalLength = 628.32;
        let offset = totalLength - (percentage/100) * totalLength;
    
        let fgCircle = document.querySelector(".circle-fg");
        fgCircle.style.strokeDashoffset = offset;
    
        document.querySelector(".circle-text").textContent = `${remaining} left`;
        
        if(remaining === 0) {
            launchConfetti();
            showRewardingMessage(); // Call a function to show the rewarding message
        }
    }

    function showRewardingMessage() {
        const rewardingMessages = [
            "Congratulations! Keep up the good work!",
            "Wow, you did it! You're on fire!",
            "Incredible! You've hit your target!",
        ];

        const randomMessage = rewardingMessages[Math.floor(Math.random() * rewardingMessages.length)];

        document.querySelector('.prtext').textContent = randomMessage;
    }


    document.getElementById('resetBtn').addEventListener('click', function() {
        const userConfirmation = confirm("Whoa there! Are you trying to time-travel back to the start of the day? Resetting will do just that (well, not really... but you get the drift). Ready to rewind");

        if (userConfirmation) {
            resetAll();
        }
    });

    function launchConfetti() {
        jsConfetti.addConfetti({
            confettiNumber: 300,
            confettiColors: ['#FDFD96', '#FFFB17', '#6C2B85', '#9B5AC8', '#3A5FAD', '#87CEEB']
        });
    }


    function displayFunnyMessage() {
        const funnyMessages = [
            "Your calories are hiding. Keep searching!"
        ];

        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

        document.querySelector('.total').textContent = randomMessage;
    }


    document.getElementById("showBmiBtn").addEventListener("click", function(){
        
    
        const bmi = weight / (Math.pow(height / 100, 2));
        document.getElementById("bmiValue").textContent = bmi.toFixed(2);
    
        const bmiCategoryElem = document.getElementById("bmiCategory");
        let previousMessageElem = document.querySelector(".bmi-message");
        if (previousMessageElem) { // if a previous message exists, remove it
            previousMessageElem.remove();
        }
        const bmiMessageElem = document.createElement("div");
        bmiMessageElem.classList.add("bmi-message");
    
        // Remove previously added classes to ensure only one is applied each time
        bmiCategoryElem.classList.remove("bmi-warning", "bmi-normal");
    
        if (bmi < 18.5) {
            bmiCategoryElem.textContent = "Underweight";
            bmiCategoryElem.classList.add("bmi-warning");
            bmiMessageElem.textContent = "You might want to consult a nutritionist.";
            bmiMessageElem.classList.add("bmi-warning-message");
        } else if (bmi < 24.9) {
            bmiCategoryElem.textContent = "Normal weight";
            bmiCategoryElem.classList.add("bmi-normal");
            bmiMessageElem.textContent = "Great job maintaining a healthy weight!";
            bmiMessageElem.classList.add("bmi-normal-message");
        } else if (bmi < 29.9) {
            bmiCategoryElem.textContent = "Overweight";
            bmiCategoryElem.classList.add("bmi-warning");
            bmiMessageElem.textContent = "A healthier lifestyle might benefit you.";
            bmiMessageElem.classList.add("bmi-warning-message");
        } else {
            bmiCategoryElem.textContent = "Obese";
            bmiCategoryElem.classList.add("bmi-warning");
            bmiMessageElem.textContent = "It's important to consult a healthcare provider.";
            bmiMessageElem.classList.add("bmi-warning-message");
        }
    
        // Append the message after BMI category
        document.querySelector(".bmi-result").appendChild(bmiMessageElem);
    
        // Show the BMI result
        document.querySelector(".bmi-result").style.display = "block";
    });

    function resetAll() {
        // Reset input values
        document.getElementById('exercise').value = 'cardio';
        document.getElementById('minutes').value = '';
        
        // Reset total calories burned
        totalCaloriesBurned = 0;
    
        // Reset calories burned message
        document.querySelector('.total').textContent = "Fantastic! You've burned 0 calories. Keep it up!";
    
        // Reset progress bar and text
        updateProgressBar(0, goal);
    
        // Reset the rewarding message
        document.querySelector('.prtext').textContent = "Almost There! Keep Pushing!";
    
        // Reset BMI display
        document.getElementById("bmiValue").textContent = "";
        document.getElementById("bmiCategory").textContent = "";
    
        // Hide the BMI result container
        document.querySelector(".bmi-result").style.display = "none";
    
        // Remove any appended BMI messages
        let bmiMessageElem = document.querySelector(".bmi-message");
        if (bmiMessageElem) {
            bmiMessageElem.remove();
        }
    };

    })
    .catch(error => {
        console.error('Error:', error);
    });
});
