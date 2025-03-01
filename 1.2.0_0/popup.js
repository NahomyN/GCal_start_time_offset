const delayInputElement = document.getElementById("delay")
const persistInputElement = document.getElementById("persistDuration")
const persistTooltipIconElement = document.getElementById("persistDuration_tooltip_icon")
const persistTooltipElement = document.getElementById("persistDuration_tooltip")
const enableExtensionElement = document.getElementById("enableExtension")


// Load values from localstorage on popup init
chrome.storage.sync.get("startTimeOffsetInMinutes", data => delayInputElement.value = data.startTimeOffsetInMinutes)
chrome.storage.sync.get("persistDuration", data => persistInputElement.checked = !!data.persistDuration)
chrome.storage.sync.get("enabled", data => {
  enableExtensionElement.checked = data.enabled !== undefined ? data.enabled : true
  delayInputElement.disabled = !enableExtensionElement.checked
  persistInputElement.disabled = !enableExtensionElement.checked
})


// Add listeners to keep localstorage in sync as user updates controls
delayInputElement.addEventListener("input", e => {
  const startTimeOffsetInMinutes = parseInt(e.target.value)
  chrome.storage.sync.set({ startTimeOffsetInMinutes })
})
persistInputElement.addEventListener("change", e => {
  const persistDuration = e.target.checked
  chrome.storage.sync.set({ persistDuration })
})

enableExtensionElement.addEventListener("change", e => {
  const enabled = e.target.checked
  chrome.storage.sync.set({ enabled })
  delayInputElement.disabled = !enabled
  persistInputElement.disabled = !enabled
})


// Add listener for tooltip
persistTooltipIconElement.addEventListener("mouseover", e => {
  persistTooltipElement.style.display = "block"
})
