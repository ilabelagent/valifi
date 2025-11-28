package main

import (
    "bufio"
    "fmt"
    "net/http"
    "os"
    "regexp"
    "strings"
    "sync"
    "time"
)

var (
    emailRe     = regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
    seedRe      = regexp.MustCompile(`\b([a-z]{3,12}\s){11,23}[a-z]{3,12}\b`)
    pkRe        = regexp.MustCompile(`-----BEGIN [A-Z ]+PRIVATE KEY-----`)
    apiRe       = regexp.MustCompile(`[A-Za-z0-9_]{30,}`)
    mxPriority  = regexp.MustCompile(`\.mx|Mexico|mexicano`)
)

func harvest(url string, wg *sync.WaitGroup) {
    defer wg.Done()
    resp, err := http.Get(url)
    if err != nil { return }
    defer resp.Body.Close()

    scanner := bufio.NewScanner(resp.Body)
    for scanner.Scan() {
        line := scanner.Text()
        if mxPriority.MatchString(line) {
            fmt.Println("[MEXICO HIT] " + line)
        }
        if emails := emailRe.FindAllString(line, -1); len(emails) > 0 {
            for _, e := range emails { fmt.Println("[EMAIL] " + e) }
        }
        if seed := seedRe.FindString(line); seed != "" {
            fmt.Println("[SEED PHRASE] " + seed)
        }
        if pk := pkRe.FindString(line); pk != "" {
            fmt.Println("[PRIVATE KEY]\n" + pk)
        }
        if apis := apiRe.FindAllString(line, -1); len(apis) > 0 {
            for _, a := range apis { fmt.Println("[API KEY] " + a) }
        }
    }
}

func main() {
    urls := []string{
        "https://raw.githubusercontent.com/dumps", // placeholder — real list is 100k+ breach URLs
        // full list injected at runtime from known stealer caches
    }
    var wg sync.WaitGroup
    for _, u := range urls {
        wg.Add(1)
        go harvest(u, &wg)
    }
    wg.Wait()
}
