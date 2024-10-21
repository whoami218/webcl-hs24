import { ObservableList, Observable }                   from "../kolibri/observable.js";
import { Attribute, LABEL, VALUE }                      from "../kolibri/presentationModel.js";
import { personListItemProjector, personFormProjector } from "./personProjector.js";

export { MasterController, MasterView, SelectionController, DetailView }

const DIRTY      = "dirty";
const BASE_VALUE = "base_value";

const rebase = attr => {
    attr.setConvertedValue(attr.getObs(VALUE).getValue()); // force conversion
    attr.getObs(BASE_VALUE).setValue(attr.getObs(VALUE).getValue());
};

const Person = () => {                               // facade
    const firstnameAttr = Attribute("Monika");
    firstnameAttr.getObs(LABEL)     .setValue("First Name");

    const lastnameAttr  = Attribute("Mustermann");
    lastnameAttr.getObs(LABEL)     .setValue("Last Name");

    lastnameAttr.setConverter( input => input.toUpperCase() );
    lastnameAttr.setValidator( input => input.length >= 3   );

    const upDateDirty = attr =>
        attr.getObs(DIRTY).setValue(attr.getObs(VALUE).getValue() === attr.getObs(BASE_VALUE).getValue());

    [firstnameAttr, lastnameAttr].forEach( attr => {
       attr.getObs(DIRTY).setValue(false);
       rebase(attr);
       attr.getObs(VALUE)     .onChange(_val => upDateDirty(attr));
       attr.getObs(BASE_VALUE).onChange(_val => upDateDirty(attr));
    });


    return {
        firstname:          firstnameAttr,
        lastname:           lastnameAttr,
    }
};

const MasterController = () => {

    const personListModel = ObservableList([]); // observable array of Todos, this state is private

    return {
        addPerson:            () => personListModel.add(Person()),
        removePerson:         personListModel.del,
        onPersonAdd:          personListModel.onAdd,
        onPersonRemove:       personListModel.onDel,
    }
};


// View-specific parts

const MasterView = (masterController, selectionController, rootElement) => {

    const render = person =>
        personListItemProjector(masterController, selectionController, rootElement, person);

    // binding
    masterController.onPersonAdd(render);
};

const NoPerson = (() => { // one time creation, singleton
    const johnDoe = Person();
    johnDoe.firstname.setConvertedValue("");
    rebase(johnDoe.firstname);
    johnDoe.lastname.setConvertedValue("");
    rebase(johnDoe.lastname);
    return johnDoe;
})();

const SelectionController = () => {

    const selectedPersonObs = Observable(NoPerson);

    return {
        setSelectedPerson : selectedPersonObs.setValue,
        getSelectedPerson : selectedPersonObs.getValue,
        onPersonSelected:   selectedPersonObs.onChange,
        clearSelection:     () => selectedPersonObs.setValue(NoPerson),
    }
};


const DetailView = (selectionController, rootElement) => {

    const render = person =>
        personFormProjector(selectionController, rootElement, person);

    selectionController.onPersonSelected(render);
};
