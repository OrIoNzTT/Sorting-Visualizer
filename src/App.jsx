import React, { useEffect, useRef, useState } from "react";

const ALGO_LABELS = {
  bubble: "Bubble Sort",
  selection: "Selection Sort",
  insertion: "Insertion Sort",
  merge: "Merge Sort",
  quick: "Quick Sort",
};

const COMPLEXITY = {
  bubble: { time: "O(n²)", space: "O(1)" },
  selection: { time: "O(n²)", space: "O(1)" },
  insertion: { time: "O(n²) avg/worst, O(n) best", space: "O(1)" },
  merge: { time: "O(n log n)", space: "O(n)" },
  quick: { time: "O(n log n) avg, O(n²) worst", space: "O(log n)" },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function App() {
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(50);
  const [speed, setSpeed] = useState(4);
  const [algorithm, setAlgorithm] = useState("bubble");
  const [isSorting, setIsSorting] = useState(false);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const [highlighted, setHighlighted] = useState([]);
  const [swapped, setSwapped] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [status, setStatus] = useState("Ready");

  // used to cancel async loops when STOP is pressed
  const cancelRef = useRef(false);

  useEffect(() => {
    generateArray();
    // eslint-disable-next-line
  }, [size]);

  // more levels + much faster at max
  function getDelay() {
    const level = Number(speed); // 1..8
    switch (level) {
      case 1: return 5;    // insane fast
      case 2: return 15;
      case 3: return 30;
      case 4: return 50;
      case 5: return 80;
      case 6: return 120;
      case 7: return 170;
      case 8: return 230;  // slowest
      default: return 50;
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function resetStats() {
    setStats({ comparisons: 0, swaps: 0 });
  }

  function incComparison() {
    setStats((s) => ({ ...s, comparisons: s.comparisons + 1 }));
  }

  function incSwap() {
    setStats((s) => ({ ...s, swaps: s.swaps + 1 }));
  }

  function generateArray() {
    if (isSorting) return;
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(randomInt(20, 330));
    }
    setArray(arr);
    setHighlighted([]);
    setSwapped([]);
    setSorted([]);
    resetStats();
    setStatus("New array");
  }

  async function visualize(arr, highlight = [], swap = [], sortedIdx = []) {
    if (cancelRef.current) return;
    setArray([...arr]);
    setHighlighted(highlight);
    setSwapped(swap);
    setSorted(sortedIdx);
    await sleep(getDelay());
  }

  function disableControls() {
    setIsSorting(true);
  }

  function enableControls() {
    setIsSorting(false);
    setHighlighted([]);
    setSwapped([]);
  }

  // =======================
  // Sorting Algorithms
  // Each checks cancelRef.current to stop early
  // =======================

  async function bubbleSort() {
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let swappedFlag = false;
      for (let j = 0; j < n - i - 1; j++) {
        if (cancelRef.current) return;
        incComparison();
        await visualize(arr, [j, j + 1]);
        if (cancelRef.current) return;
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          incSwap();
          await visualize(arr, [], [j, j + 1]);
          swappedFlag = true;
        }
      }
      if (!swappedFlag) break;
    }
    if (!cancelRef.current) {
      await visualize(arr, [], [], [...Array(arr.length).keys()]);
    }
  }

  async function selectionSort() {
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (cancelRef.current) return;
        incComparison();
        await visualize(arr, [minIdx, j], [], [...Array(i).keys()]);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      if (cancelRef.current) return;
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        incSwap();
        await visualize(arr, [], [i, minIdx], [...Array(i + 1).keys()]);
      }
    }
    if (!cancelRef.current) {
      await visualize(arr, [], [], [...Array(arr.length).keys()]);
    }
  }

  async function insertionSort() {
    const arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      if (cancelRef.current) return;
      const key = arr[i];
      let j = i - 1;

      while (j >= 0 && arr[j] > key) {
        if (cancelRef.current) return;
        incComparison();
        arr[j + 1] = arr[j];
        incSwap();
        await visualize(arr, [j, j + 1], [j + 1], [...Array(i).keys()]);
        j--;
      }
      if (cancelRef.current) return;
      arr[j + 1] = key;
      incSwap();
      await visualize(arr, [], [j + 1], [...Array(i + 1).keys()]);
    }
    if (!cancelRef.current) {
      await visualize(arr, [], [], [...Array(arr.length).keys()]);
    }
  }

  async function mergeSortWrapper() {
    const arr = [...array];
    await mergeSort(arr, 0, arr.length - 1);
    if (!cancelRef.current) {
      await visualize(arr, [], [], [...Array(arr.length).keys()]);
    }
  }

  async function mergeSort(arr, left, right) {
    if (cancelRef.current) return;
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    await mergeSort(arr, left, mid);
    await mergeSort(arr, mid + 1, right);
    await merge(arr, left, mid, right);
  }

  async function merge(arr, left, mid, right) {
    if (cancelRef.current) return;

    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      if (cancelRef.current) return;
      incComparison();
      await visualize(
        arr,
        [k],
        [],
        Array.from({ length: left }, (_, idx) => idx)
      );
      if (cancelRef.current) return;
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      incSwap();
      await visualize(arr, [], [k], []);
      k++;
    }

    while (i < leftArr.length) {
      if (cancelRef.current) return;
      arr[k] = leftArr[i];
      i++;
      k++;
      incSwap();
      await visualize(arr, [], [k - 1], []);
    }

    while (j < rightArr.length) {
      if (cancelRef.current) return;
      arr[k] = rightArr[j];
      j++;
      k++;
      incSwap();
      await visualize(arr, [], [k - 1], []);
    }
  }

  async function quickSortWrapper() {
    const arr = [...array];
    await quickSort(arr, 0, arr.length - 1);
    if (!cancelRef.current) {
      await visualize(arr, [], [], [...Array(arr.length).keys()]);
    }
  }

  async function quickSort(arr, low, high) {
    if (cancelRef.current) return;
    if (low < high) {
      const pi = await partition(arr, low, high);
      await quickSort(arr, low, pi - 1);
      await quickSort(arr, pi + 1, high);
    }
  }

  async function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low;

    for (let j = low; j < high; j++) {
      if (cancelRef.current) return i;
      incComparison();
      await visualize(arr, [j, high], [], []);
      if (cancelRef.current) return i;
      if (arr[j] < pivot) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        incSwap();
        await visualize(arr, [], [i, j], []);
        i++;
      }
    }

    [arr[i], arr[high]] = [arr[high], arr[i]];
    incSwap();
    await visualize(arr, [], [i, high], []);
    return i;
  }

  // =======================
  // Handlers
  // =======================

  async function handleStart() {
    if (isSorting) return;
    if (array.length === 0) return;

    cancelRef.current = false;
    setStatus("Sorting...");
    resetStats();
    setSorted([]);
    setHighlighted([]);
    setSwapped([]);
    disableControls();

    const map = {
      bubble: bubbleSort,
      selection: selectionSort,
      insertion: insertionSort,
      merge: mergeSortWrapper,
      quick: quickSortWrapper,
    };

    const fn = map[algorithm];

    await fn();

    if (cancelRef.current) {
      setStatus("Stopped");
    } else {
      setStatus("Done");
    }

    enableControls();
    cancelRef.current = false;
  }

  function handleStop() {
    if (!isSorting) return;
    cancelRef.current = true;
    setStatus("Stopping...");
  }

  const { time, space } = COMPLEXITY[algorithm];
  const maxVal = Math.max(...array, 1);

  return (
    <div className="app">
      <header className="app-header">
        <div className="title">
          Sorting Visualizer
          <span className="title-pill">React</span>
        </div>
        <p className="subtitle">
          Watch classic sorting algorithms run step by step on a random array.
          Change size, speed and algorithm in real time.
        </p>
      </header>

      <section className="controls">
        <div className="control-group">
          <label className="control-label" htmlFor="algorithm">
            Algorithm
          </label>
          <select
            id="algorithm"
            value={algorithm}
            disabled={isSorting}
            onChange={(e) => {
              setAlgorithm(e.target.value);
              setStatus("Ready");
              setSorted([]);
              setHighlighted([]);
              setSwapped([]);
            }}
          >
            <option value="bubble">Bubble Sort</option>
            <option value="selection">Selection Sort</option>
            <option value="insertion">Insertion Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>
          </select>
        </div>

        <div className="control-group">
          <span className="control-label">Array Size</span>
          <input
            type="range"
            min="10"
            max="160"
            value={size}
            disabled={isSorting}
            onChange={(e) => setSize(Number(e.target.value))}
          />
          <span className="range-value">{size}</span>
        </div>

        <div className="control-group">
          <span className="control-label">Speed</span>
          <input
            type="range"
            min="1"
            max="8"
            value={speed}
            disabled={isSorting}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className="range-value">{speed}</span>
        </div>

        <div className="button-group">
          <button
            className="btn btn-secondary"
            disabled={isSorting}
            onClick={generateArray}
          >
            New Array
          </button>
          <button
            className="btn btn-primary"
            disabled={isSorting}
            onClick={handleStart}
          >
            Start
          </button>
          <button
            className="btn btn-danger"
            disabled={!isSorting}
            onClick={handleStop}
          >
            Stop
          </button>
        </div>
      </section>

      <section className="visualizer-wrapper">
        <div className="visualizer-header">
          <span>{ALGO_LABELS[algorithm]}</span>
          <span>{status}</span>
        </div>
        <div className="visualizer">
          {array.map((value, idx) => {
            const heightPercent = Math.max((value / maxVal) * 100, 8);
            const isHighlight = highlighted.includes(idx);
            const isSwap = swapped.includes(idx);
            const isSorted = sorted.includes(idx);

            let className = "bar";
            if (isSorted) className += " sorted";
            else if (isSwap) className += " swap";
            else if (isHighlight) className += " highlight";

            return (
              <div
                key={idx}
                className={className}
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>
      </section>

      <section className="info">
        <div className="badge">
          <span className="badge-dot" />
          <span>Comparisons: {stats.comparisons}</span>
        </div>
        <div className="badge">
          <span className="badge-dot blue" />
          <span>Swaps/Writes: {stats.swaps}</span>
        </div>
        <div className="complexity">
          Time: <span>{time}</span> | Space: <span>{space}</span>
        </div>
      </section>
    </div>
  );
}

export default App;
