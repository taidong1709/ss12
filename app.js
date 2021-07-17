let $ = (...x) => document.querySelector(...x);
/** @type {HTMLUListElement} */
const coffeeList = $("#coffee-list");
/** @type {HTMLFormElement} */
const addForm = $("form#add-coffee-form");

(async () => {
    let list = [];

    let renderCoffeeShops = item => {
        let data = item.data();
    
        let li = document.createElement("li");
        li.setAttribute("data-id", item.id);
    
        let name = li.appendChild(document.createElement("span"));
        let city = li.appendChild(document.createElement("span"));
        let deleteBtn = li.appendChild(document.createElement("div"));
    
        name.innerText = data.name;
        city.innerText = data.city;
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.float = "right";
        deleteBtn.style.width = "16px";
        deleteBtn.style.marginTop = "-40px";
        deleteBtn.style.marginRight = "12px";
        deleteBtn.innerText = "❌";
        deleteBtn.addEventListener("click", async () => {
            await db.collection("coffee").doc(item.id).delete();
        });

        let nameEdit = false, cityEdit = false;
        city.addEventListener("dblclick", () => {
            if (!cityEdit && !nameEdit) {
                cityEdit = true;
                city.innerHTML = "";
                let i = city.appendChild(document.createElement("input"));
                i.style.fontWeight = "inherit";
                i.style.fontSize = "inherit";
                i.style.color = "inherit";
                i.style.height = "0.9em";
                i.value = data.city;
                i.focus();

                let updateFunc = async (cancel) => {
                    let nextValue = i.value;
                    city.removeChild(i);
                    city.innerText = data.city;
                    cityEdit = false;
                    if (!cancel) {
                        await db.collection("coffee").doc(item.id).set({
                            name: data.name,
                            city: nextValue
                        });
                    }
                }

                i.addEventListener("focusout", () => updateFunc(false));
                i.addEventListener("keydown", e => {
                    if (e.key === "Escape") {
                        updateFunc(true);
                    } else if (e.key === "Enter") {
                        updateFunc(false);
                    }
                });
            }
        });
        name.addEventListener("dblclick", () => {
            if (!cityEdit && !nameEdit) {
                nameEdit = true;
                name.innerHTML = "";
                let i = name.appendChild(document.createElement("input"));
                i.style.fontWeight = "inherit";
                i.style.fontSize = "inherit";
                i.style.color = "inherit";
                i.style.height = "1.1em";
                i.value = data.name;
                i.focus();

                let updateFunc = async (cancel) => {
                    let nextValue = i.value;
                    name.removeChild(i);
                    name.innerText = data.name;
                    nameEdit = false;
                    if (!cancel) {
                        await db.collection("coffee").doc(item.id).set({
                            name: nextValue,
                            city: data.city
                        });
                    }
                }

                i.addEventListener("focusout", e => updateFunc(false));
                i.addEventListener("keydown", e => {
                    if (e.key === "Escape") {
                        updateFunc(true);
                    } else if (e.key === "Enter") {
                        updateFunc(false);
                    }
                });
            }
        });

        return li;
    };

    addForm.addEventListener("submit", async e => {
        e.preventDefault();

        if (addForm.cfname.value && addForm.cfcity.value) {
            await db.collection("coffee").add({
                name: addForm.cfname.value.trim(),
                city: addForm.cfcity.value.trim()
            });

            addForm.cfname.value = "";
            addForm.cfcity.value = "";
        }
    });

    async function render(snapshot) {
        let docChanges = snapshot.docChanges();
        for (let docChange of docChanges) {
            switch (docChange.type) {
                case "added":
                    list.splice(docChange.newIndex, 0, renderCoffeeShops(docChange.doc));
                    break;
                case "modified":
                    list[docChange.newIndex] = renderCoffeeShops(docChange.doc);
                    break;
                case "removed":
                    list.splice(docChange.newIndex - 1, 1);
                    break;
            }
            [...coffeeList.children].forEach(e => coffeeList.removeChild(e));
            list.map(e => coffeeList.appendChild(e));
        }
    }

    db.collection("coffee").onSnapshot({ next: render });
})()
