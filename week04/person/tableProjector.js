import {EDITABLE, LABEL, VALID, VALUE} from "../kolibri/presentationModel.js";

export { personListItemProjector, personFormProjector }


const bindTextInput = (textAttr, inputElement) => {
    inputElement.oninput = _ => textAttr.setConvertedValue(inputElement.value);

    textAttr.getObs(VALUE).onChange(text => inputElement.value = text);

    textAttr.getObs(VALID, true).onChange(
        valid => valid
            ? inputElement.classList.remove("invalid")
            : inputElement.classList.add("invalid")
    );

    textAttr.getObs(EDITABLE, true).onChange(
        isEditable => isEditable
            ? inputElement.removeAttribute("readonly")
            : inputElement.setAttribute("readonly", true));

    textAttr.getObs(LABEL).onChange(
        label => inputElement.setAttribute("title", label)
    )
};

const personListItemProjector = (masterController, selectionController, rootElement, person) => {
    const deleteButton = document.createElement("Button");
    deleteButton.setAttribute("class","delete");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = _ => masterController.removePerson(person);

    const firstnameInputElement= document.createElement("input");
    bindTextInput(person.firstname, firstnameInputElement);
    firstnameInputElement.setAttribute("type", "text");
    const lastnameInputElement = document.createElement("input");
    bindTextInput(person.lastname, lastnameInputElement);
    lastnameInputElement.setAttribute("type", "text");

    firstnameInputElement.onclick = _ => selectionController.setSelectedPerson(person);
    lastnameInputElement.onclick = _ => selectionController.setSelectedPerson(person);

    const newRow = document.createElement("tr");

    selectionController.onPersonSelected(
        selected => selected === person
            ? newRow.classList.add("selected")
            : newRow.classList.remove("selected")
    );

    masterController.onPersonRemove( (removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        rootElement.removeChild(newRow);
        selectionController.clearSelection();
        removeMe();
    } );


    newRow.appendChild(deleteButton);
    newRow.appendChild(firstnameInputElement);
    newRow.appendChild(lastnameInputElement);

    rootElement.appendChild(newRow);

}

const personFormProjector = (detailController, rootElement, person) => {
    const tableElement = document.createElement("TABLE");
    tableElement.innerHTML = `
        <tr>
            <td>First Name</td>
            <td><input type="text" id="first-name"></td>
        </tr>
        <tr>
            <td>Last Name</td>
            <td><input type="text" id="last-name"></td>
        </tr>
    `;
    bindTextInput(person.firstname, tableElement.querySelector("#first-name"));
    bindTextInput(person.lastname, tableElement.querySelector("#last-name"));

    rootElement.firstChild.replaceWith(tableElement);
}
