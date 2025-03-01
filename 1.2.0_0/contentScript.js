var observeDOM = (function() {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  return function (obj, callback) {
    if (!obj || obj.nodeType !== 1) return;

    if (MutationObserver) {
      // define a new observer
      var mutationObserver = new MutationObserver(callback)

      // have the observer observe for changes in children
      mutationObserver.observe(obj, {childList:true, subtree:true})
      return mutationObserver
    }

    // browser support fallback
    else if (window.addEventListener) {
      obj.addEventListener('DOMNodeInserted', callback, false)
      obj.addEventListener('DOMNodeRemoved', callback, false)
    }
  }
})()

const getElementOrThrow = (queryFn, context = 'Unknown') => {
  const element = queryFn();
  if (!element) {
    const error = `Failed to find element (${context})`;
    console.error(error);
    throw new Error(error);
  }
  return element;
};

const mutateTime = async function(containerElementJSName, mutationInMinutes) {
  // Grab whitespace to click out of input later
  let modalWhiteSpace = getElementOrThrow(() => document.querySelectorAll("[jsname='uxAMZ']")[0], "Modal whitespace") // uxAMZ is the jsname value of the div containing the white space of the part of the modal that doesn't contain the title input or the buttons at the bottom

  // Mutate iCal data attribute
  const containerElement = getElementOrThrow(() => document.querySelectorAll(`[jsname="${containerElementJSName}"]`)[0], "Time container")
  const originalIcalValue = containerElement.getAttribute('data-ical')
  const newIcalValueInt = parseInt(originalIcalValue.substring(1)) + (mutationInMinutes * 100)
  const newIcalValue = 'T' + newIcalValueInt.toString().padStart(6, '0')
  containerElement.setAttribute('data-ical', newIcalValue)

  // Mutate input control (can change to anything, Google looks at the above)
  const inputElement = getElementOrThrow(() => document.querySelectorAll(`[jsname="${containerElementJSName}"] input`)[0], "Time input")
  const newValue = "whatever"
  inputElement.setAttribute('data-initial-value', newValue)

  // Click in and out of the input to trigger Google UI scripts (simulate real user input)
  inputElement.click()

  await new Promise(r => setTimeout(r, wait));
  console.log("Clicking out of input")
  modalWhiteSpace.dispatchEvent(new MouseEvent('mousedown'))
  modalWhiteSpace.dispatchEvent(new MouseEvent('mouseup'))
}

const callback = function() {
  if (modalVisible !== !!modalContainer.children.length) {
    modalVisible = !!modalContainer.children.length

    if (modalVisible) {
      chrome.storage.sync.get("enabled", data => {
        const enabled = data.enabled !== undefined ? data.enabled : true
        if (!enabled) return;

        new Promise(r => setTimeout(r, wait))
          .then(() => {
            // 1. Expand datetime section of modal
            const timeslotButton = getElementOrThrow(() => document.querySelectorAll('[jsname="TAmOZ"] button')[0], "Timeslot expand button")
            timeslotButton.click()

            chrome.storage.sync.get("startTimeOffsetInMinutes", async data => {
              const offset = parseInt(data.startTimeOffsetInMinutes)

              // 2. Adjust start-time
              await new Promise(r => setTimeout(r, wait + 100))
              console.log("Adjusting start-time")
              await mutateTime("B4GDSd", offset)

              chrome.storage.sync.get("persistDuration", async data => {
                const persist = !!data.persistDuration
                if (!persist) {
                  // 3. Adjust the subsequently changed end-time
                  await new Promise(r => setTimeout(r, wait + 100))
                  console.log("Resetting end-time")
                  await mutateTime("XCHdmd", -offset)
                }

                // 4. Focus back to the "title" input
                await new Promise(r => setTimeout(r, wait))
                console.log("Giving focus back to Title input")
                const titleElement = getElementOrThrow(() => document.querySelectorAll(`[jsname="GYcwYe"] > [jsname="vhZMvf"] input`)[0], "Title input")
                titleElement.focus()
              })
            })
          })
      })
    }
  }
}


// Main execution
let modalVisible = false
const wait = 100
const modalContainer = document.getElementById("yDmH0d") // yDmH0d is the jsname value of the div containing the DOM tree that is the modal (it is visible but empty when the model is not visible)
observeDOM(modalContainer, callback)

