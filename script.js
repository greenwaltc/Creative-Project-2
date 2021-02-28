function onClick(e) {
    e.preventDefault()

    let s = document.getElementById('selector');
    let selected_type = s.options[s.selectedIndex].value;

    const Http = new XMLHttpRequest();

    if (selected_type == "food") {
        let food = document.getElementById('field').value;
        if (food === "") {
            document.getElementById('search-button-comment').textContent = 'Enter a food!'
            return;
        }

        let uri = "https://trackapi.nutritionix.com/v2/search/instant?query=" + food;
        let encoded = encodeURI(uri);
        Http.responseType = 'json';
        Http.open('GET', encoded);
        Http.setRequestHeader('x-app-id', '96162f5f');
        Http.setRequestHeader('x-app-key', 'd2f382a9d9a4f3012119f045afc00c70')
        Http.send();

        Http.onload = (e) => {
            console.log(Http.response);
            getNutritionInfo(Http.response);
        }
    }
    else if (selected_type == "exercise") {

        let search_results = document.getElementById('search-results');
        search_results.innerHTML = "";

        let uri = "https://trackapi.nutritionix.com/v2/natural/exercise";
        let encoded = encodeURI(uri);
        Http.responseType = 'json';
        Http.open('POST', encoded);
        Http.setRequestHeader('Content-Type', 'application/json');
        Http.setRequestHeader('x-app-id', '96162f5f');
        Http.setRequestHeader('x-app-key', 'd2f382a9d9a4f3012119f045afc00c70');
        Http.send(JSON.stringify(
            {
                "query": document.getElementById('exercise-field').value,
                "gender": document.getElementById('gender-field').value,
                "weight_kg": document.getElementById('weight-field').value,
                "height_cm": document.getElementById('height-field').value,
                "age": document.getElementById('age-field').value
            }
        ));
        Http.onload = (e) => {
            console.log(Http.response);
            search_results.innerHTML = "<h3>You burned " + Http.response.exercises[0].nf_calories + " calories!</h3>";
        }
    }
}

function updateSelection(e) {
    e.preventDefault();
    let s = document.getElementById('selector');
    let type = s.options[s.selectedIndex].value;
    updateInstructions(type);

    if (type === "exercise") {
        // Update field entries
        let field_entries = document.getElementById('field-entries');
        field_entries.innerHTML = "";
        field_entries.innerHTML = "<input placeholder='Exercise Description' id='exercise-field'>" +
            "<br>" +
            "<input placeholder='Gender' id='gender-field'>" +
            "<br>" +
            "<input placeholder='Weight (kg)' id='weight-field'>" +
            "<br>" +
            "<input placeholder='Height (cm)' id='height-field'>" +
            "<br>" +
            "<input placeholder='Age' id='age-field'>";
    }
}

function updateInstructions(type) {
    if (type == "food") {
        console.log("Selected food");
        document.getElementById('search-instructions').textContent = "Enter the name of" +
            " a food to get its nutrition facts.";
        document.getElementById('field').placeholder = 'Food Name'
    }
    else if (type == "exercise") {
        console.log("Selected exercise");
        document.getElementById('search-instructions').textContent = "Enter exercise and time. For example: \"Weightlifting for 30 minutes\". Output will be calories burned.";
        document.getElementById('field').placeholder = 'Exercise description'
    }
}

function getNutritionInfo(response) {
    let natural_lang_name = response.common[0].food_name;

    // Use the common name from the /search/instant request to run a Natural Language API request
    let uri = 'https://trackapi.nutritionix.com/v2/natural/nutrients';
    let encoded = encodeURI(uri);
    let Http = new XMLHttpRequest();
    Http.responseType = 'json';
    Http.open('POST', encoded);
    Http.setRequestHeader('Content-Type', 'application/json');
    Http.setRequestHeader('x-app-id', '96162f5f');
    Http.setRequestHeader('x-app-key', 'd2f382a9d9a4f3012119f045afc00c70');
    Http.send(JSON.stringify(
        {
            "query": natural_lang_name,
            "timezone": "US/Mountain"
        }
    ));

    Http.onload = (e) => {
        console.log(Http.response);
        formatFoodResponse(Http.response);
    }
}

function formatFoodResponse(json) {
    console.log(json);

    let search_results = document.getElementById('search-results');
    search_results.textContent = ''; // Reset the context of search results each time

    // Set heading
    let heading = document.createElement('h2');
    heading.innerHTML = 'Nutrition information for ' + json.foods[0].food_name;
    search_results.appendChild(heading);

    let nutrition_facts = document.createElement('div');
    nutrition_facts.className = 'nutrition-facts';

    let serving_info = "Serving size: " + json.foods[0].serving_qty + " " + json.foods[0].serving_unit;
    let serving_size = document.createElement("h4");
    serving_size.innerHTML = serving_info;
    nutrition_facts.appendChild(serving_size);


    // Create table of of nutrition facts
    let table = document.createElement('table');
    for (let [key, value] of Object.entries(json.foods[0])) {
        if (key.search('nf_') != -1) {
            let row = document.createElement('tr');
            let attribute = key.split("_");
            attribute.shift();
            attribute = attribute.join(" ");
            let attribute_cell = document.createElement('td');
            attribute_cell.innerHTML = attribute;
            attribute_cell.style.textAlign = 'left';
            let value_cell = document.createElement('td');
            value_cell.innerHTML = value;
            value_cell.style.textAlign = 'right';
            row.appendChild(attribute_cell);
            row.appendChild(value_cell);
            table.appendChild(row);
        }
    }
    nutrition_facts.appendChild(table);
    search_results.appendChild(nutrition_facts);
}

let s = document.getElementById('selector');
let type = s.options[s.selectedIndex].value;
updateInstructions(type);

document.getElementById('search').addEventListener('click', onClick);
document.getElementById('selector').addEventListener('change', updateSelection);